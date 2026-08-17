"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { useBookmarks } from "@/hooks/useBookmarks";
import { UniversityCard } from "@/components/university/UniversityCard";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";
import type { SlimSearchToken } from "@/types/university.types";

interface MarketingHomeClientProps {
  initialUniversities?: SlimSearchToken[];
}

export function MarketingHomeClient({ initialUniversities = [] }: MarketingHomeClientProps) {
  const { language } = useLanguage();
  const { index: universitiesDatabase } = useUniversitySearch(initialUniversities);
  const { bookmarks = [] } = useBookmarks();
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);

  // Search state
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  // Recommendations logic
  const recommendations = useMemo(() => {
    if (!universitiesDatabase || universitiesDatabase.length === 0) return [];

    const bookmarkedIds = new Set(
      bookmarks.map((b: any) => String(b.universityId || b.university?.id))
    );

    // 1. If user has bookmarks, recommend similar universities
    if (bookmarkedIds.size > 0) {
      const bookmarkedModels = new Set<string>();
      const bookmarkedCities = new Set<string>();
      const bookmarkedTypes = new Set<string>();

      universitiesDatabase.forEach((u: any) => {
        if (bookmarkedIds.has(String(u.id))) {
          if (u.educationModel) bookmarkedModels.add(String(u.educationModel).toUpperCase());
          if (u.city) bookmarkedCities.add(String(u.city).toLowerCase());
          if (u.type) bookmarkedTypes.add(String(u.type).toUpperCase());
        }
      });

      const matched = universitiesDatabase.filter((u: any) => {
        if (bookmarkedIds.has(String(u.id))) return false;
        const uModel = String(u.educationModel || "").toUpperCase();
        const uCity = String(u.city || "").toLowerCase();
        const uType = String(u.type || "").toUpperCase();
        return bookmarkedModels.has(uModel) || bookmarkedCities.has(uCity) || bookmarkedTypes.has(uType);
      });

      if (matched.length > 0) {
        return matched.slice(0, 3);
      }
    }

    // 2. Default Top Recommended Curated Unis: GUC, Nile University, AUC
    const preferredSlugs = [
      "german-university-in-cairo",
      "nile-university",
      "the-american-university-in-cairo",
    ];
    const topPicks = preferredSlugs
      .map((slug) => universitiesDatabase.find((u: any) => u.slug === slug))
      .filter(Boolean);

    if (topPicks.length >= 3) {
      return topPicks as any[];
    }

    // Fallback to featured
    const featured = universitiesDatabase.filter(
      (u: any) => u.featured && !bookmarkedIds.has(String(u.id))
    );
    return (featured.length >= 3 ? featured : universitiesDatabase).slice(0, 3);
  }, [universitiesDatabase, bookmarks]);

  // Match Finder State
  const [matchStep, setMatchStep] = useState<number | "results">(1);
  const [quizSelections, setQuizSelections] = useState<{
    major: string | null;
    city: string | null;
    budget: string | null;
  }>({ major: null, city: null, budget: null });
  const [matches, setMatches] = useState<{ uni: any; score: number }[]>([]);

  const getLangField = (obj: any, field: string) => {
    if (!obj) return "";
    if (field === "name") {
      return language === "ar" ? obj.nameAr || obj.name_ar || obj.nameEn || obj.name : obj.nameEn || obj.name || obj.nameAr;
    }
    if (field === "location" || field === "city") {
      const val = language === "ar" ? obj.city_ar || obj.city || obj.governorate : obj.city || obj.governorate || obj.location;
      return val || (language === "ar" ? "مصر" : "Egypt");
    }
    if (field === "model" || field === "educationModel") {
      const model = obj.educationModel || obj.model || "EGYPTIAN";
      return model.charAt(0).toUpperCase() + model.slice(1).toLowerCase();
    }
    if (field === "type") {
      return obj.type || "";
    }
    if (language === "ar" && obj[field + "_ar"]) return obj[field + "_ar"];
    return obj[field] || "";
  };

  // Real-time Hero search results
  const heroSearchResults = useMemo(() => {
    if (!heroSearchQuery.trim()) return [];
    const qLower = heroSearchQuery.toLowerCase();
    const results: Array<{
      type: "uni" | "major";
      id: any;
      text: string;
      icon: string;
      secondary: string;
      uniData?: any;
    }> = [];

    universitiesDatabase.forEach((u: any) => {
      const uName = getLangField(u, "name");
      const uShort = u.shortName || "";
      const uType = getLangField(u, "type");
      const uCity = getLangField(u, "city");

      if (uName.toLowerCase().includes(qLower) || uShort.toLowerCase().includes(qLower)) {
        results.push({
          type: "uni",
          id: u.id,
          text: uName,
          icon: u.emoji || "🏛️",
          secondary: `${uCity} · ${uType}`,
          uniData: u,
        });
      }
    });

    return results.slice(0, 8);
  }, [heroSearchQuery, language, universitiesDatabase]);

  const handleMatchOption = (category: "major" | "city" | "budget", value: string) => {
    const updated = { ...quizSelections, [category]: value };
    setQuizSelections(updated);

    setTimeout(() => {
      if (matchStep === 1) {
        setMatchStep(2);
      } else if (matchStep === 2) {
        setMatchStep(3);
      } else {
        calculateMatches(updated);
      }
    }, 300);
  };

  const calculateMatches = (selections: typeof quizSelections) => {
    const selMajor = (selections.major || "").toLowerCase();
    const selCity = (selections.city || "").toLowerCase();
    const selBudget = selections.budget || "medium";

    const scored = universitiesDatabase.map((uni: any, index: number) => {
      let score = 0;
      const uName = (uni.nameEn || "").toLowerCase() + " " + (uni.nameAr || "");
      const uCity = (uni.city || "").toLowerCase();
      const uGov = (uni.governorate || "").toLowerCase();
      const uModel = (uni.educationModel || "").toLowerCase();
      const uType = uni.type || "PUBLIC";

      // 1. Discipline / Field Score (Max 38 pts)
      if (selMajor.includes("computer") || selMajor.includes("cs")) {
        if (uName.includes("tech") || uName.includes("german") || uName.includes("science") || uName.includes("nile") || uName.includes("zewail")) {
          score += 38;
        } else if (uType === "PUBLIC" || uType === "PRIVATE" || uType === "NATIONAL") {
          score += 30;
        } else {
          score += 18;
        }
      } else if (selMajor.includes("engineering")) {
        if (uName.includes("engineering") || uName.includes("tech") || uName.includes("german") || uName.includes("british") || uName.includes("hti")) {
          score += 38;
        } else if (uType === "PUBLIC" || uType === "NATIONAL" || uType === "PRIVATE") {
          score += 31;
        } else {
          score += 18;
        }
      } else if (selMajor.includes("business")) {
        if (uName.includes("american") || uName.includes("german") || uName.includes("british") || uName.includes("management") || uName.includes("commerce") || uName.includes("sadat")) {
          score += 38;
        } else if (uType === "PRIVATE" || uType === "NATIONAL" || uType === "PUBLIC") {
          score += 29;
        } else {
          score += 18;
        }
      } else if (selMajor.includes("pharmacy") || selMajor.includes("biotech")) {
        if (uName.includes("badr") || uName.includes("cairo") || uName.includes("ain shams") || uName.includes("msa") || uName.includes("galala") || uName.includes("ahram")) {
          score += 38;
        } else if (uType === "PUBLIC" || uType === "PRIVATE" || uType === "NATIONAL") {
          score += 29;
        } else {
          score += 18;
        }
      } else {
        score += 25;
      }

      // 2. Location Fit (Max 32 pts)
      if (selCity === "any") {
        score += 28;
      } else if (selCity === "cairo") {
        if (uGov.includes("cairo") || uCity.includes("new cairo") || uCity.includes("cairo") || uCity.includes("tagamoa") || uCity.includes("shorouk")) {
          score += 32;
        } else if (uGov.includes("giza") || uCity.includes("october") || uCity.includes("zayed")) {
          score += 20;
        } else {
          score += 8;
        }
      } else if (selCity === "giza") {
        if (uGov.includes("giza") || uCity.includes("october") || uCity.includes("zayed") || uCity.includes("giza") || uCity.includes("dokki")) {
          score += 32;
        } else if (uGov.includes("cairo") || uCity.includes("new cairo") || uCity.includes("cairo")) {
          score += 20;
        } else {
          score += 8;
        }
      } else {
        score += 15;
      }

      // 3. Budget & Type Fit (Max 26 pts)
      if (selBudget === "public") {
        if (uType === "PUBLIC") score += 26;
        else if (uType === "NATIONAL") score += 18;
        else if (uType === "PRIVATE") score += 6;
        else score += 4;
      } else if (selBudget === "medium") {
        if (uType === "NATIONAL") score += 26;
        else if (uType === "PRIVATE") score += 23;
        else if (uType === "PUBLIC") score += 16;
        else score += 12;
      } else if (selBudget === "premium") {
        if (uType === "INTERNATIONAL" || uModel === "american" || uModel === "german" || uModel === "british" || uModel === "canadian") {
          score += 26;
        } else if (uType === "PRIVATE") {
          score += 21;
        } else if (uType === "NATIONAL") {
          score += 12;
        } else {
          score += 5;
        }
      }

      // Micro-variance tie-breaker based on institution uniqueness
      const variance = ((index * 7 + (uni.slug?.length || 5)) % 5) * 0.8;
      const finalScore = Math.min(Math.round(score - variance), 97);

      return { uni, score: Math.max(finalScore, 45) };
    });

    scored.sort((a, b) => b.score - a.score);

    // Apply natural top-3 score progression
    const topMatches = scored.slice(0, 3).map((item, i) => {
      if (i === 0) return { ...item, score: Math.min(item.score, 96) };
      if (i === 1) return { ...item, score: Math.min(item.score, scored[0].score - 4) };
      return { ...item, score: Math.min(item.score, scored[0].score - 9) };
    });

    setMatches(topMatches);
    setMatchStep("results");
  };

  return (
    <div className="home-tab-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="grid-overlay"></div>
          <div className="particles">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="particle"
                style={{
                  top: `${i * 15}%`,
                  left: `${(i * 17) % 90}%`,
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge animate-in">
            <span className="badge-flag">🇪🇬</span>
            <span>
              {language === "ar"
                ? "دليلك الشامل لاختيار جامعتك في مصر"
                : "Your comprehensive guide to Egyptian universities"}
            </span>
          </div>

          <h1 className="hero-title animate-in">
            {language === "ar" ? (
              <>
                اختر الجامعة المناسبة لك
                <br />
                <span className="gradient-text">بوابة الجامعة</span>
              </>
            ) : (
              <>
                Find the right university.
                <br />
                <span className="gradient-text">University Gate</span>
              </>
            )}
          </h1>

          <p className="hero-subtitle animate-in">
            {language === "ar"
              ? "دليلك الشامل لاختيار جامعتك. قارن الجامعات المصرية جنباً إلى جنب."
              : "Your comprehensive guide to universities. Compare Egyptian universities side-by-side."}
          </p>

          {/* Search container */}
          <div className="search-container animate-in" id="heroSearch">
            <div className="search-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              id="heroSearchInput"
              placeholder={
                language === "ar"
                  ? "ابحث عن جامعة أو تخصص (مثال: هندسة، GUC، جامعة القاهرة)..."
                  : "Search a university or major…"
              }
              autoComplete="off"
              value={heroSearchQuery}
              onChange={(e) => setHeroSearchQuery(e.target.value)}
            />
            <Link href={`/universities?search=${encodeURIComponent(heroSearchQuery)}`} className="search-btn">
              {language === "ar" ? "بحث" : "Search"}
            </Link>

            {heroSearchResults.length > 0 && (
              <div className="search-results show" id="heroSearchResults">
                {heroSearchResults.map((res, i) => (
                  <div
                    key={i}
                    className="search-result-item"
                    onClick={() => {
                      if (res.uniData) {
                        setSelectedUniModal(res.uniData);
                        setHeroSearchQuery("");
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="search-result-icon">{res.icon}</div>
                    <div className="search-result-info">
                      <div className="search-result-title">{res.text}</div>
                      <div className="search-result-type">{res.secondary}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hero-links animate-in">
            <Link href="/universities" className="hero-link">
              {language === "ar" ? "تصفح جميع الجامعات" : "Browse all universities"}
            </Link>
            <span className="dot-separator">·</span>
            <Link href="/compare" className="hero-link">
              {language === "ar" ? "مقارنة" : "Compare"}
            </Link>
            <span className="dot-separator">·</span>
            <Link href="/majors" className="hero-link">
              {language === "ar" ? "استكشف التخصصات" : "Explore majors"}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar animate-in">
        <div className="stat-item">
          <div className="stat-number">
            <span>{universitiesDatabase.length}</span>
            <span className="stat-plus">+</span>
          </div>
          <div className="stat-label">{language === "ar" ? "جامعة" : "Universities"}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">
            <span>31</span>
            <span className="stat-plus">+</span>
          </div>
          <div className="stat-label">{language === "ar" ? "تخصصاً دراسياً" : "Majors"}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">
            <span>27</span>
          </div>
          <div className="stat-label">{language === "ar" ? "محافظة ومدينة" : "Cities & Regions"}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">
            <span>4</span>
          </div>
          <div className="stat-label">{language === "ar" ? "نماذج تعليمية" : "Education Models"}</div>
        </div>
      </div>

      {/* AI Match Finder Section */}
      <section className="section match-finder-section">
        <div className="container">
          <div className="match-finder-card animate-in">
            <div className="match-finder-header">
              <span className="section-badge">🎯 {language === "ar" ? "محدد التوافق" : "Match Finder"}</span>
              <h2>{language === "ar" ? "اكتشف جامعتك المثالية بنسبة التوافق" : "Find Your Perfect University Match"}</h2>
              <p>
                {language === "ar"
                  ? "أجب عن ثلاثة أسئلة سريعة لنعرض لك الجامعات الأنسب لاحتياجاتك."
                  : "Answer three quick questions to see your percentage match scores."}
              </p>
            </div>
            <div className="match-finder-body">
              {matchStep === 1 && (
                <div className="match-step active" data-step="1">
                  <div className="step-label">
                    {language === "ar"
                      ? "الخطوة 1 من 3: اختر المجال الدراسي المفضل لديك"
                      : "Step 1 of 3: Select your preferred field of study"}
                  </div>
                  <div className="match-options-grid">
                    <button
                      className={`match-option-btn ${quizSelections.major === "Computer Science" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("major", "Computer Science")}
                    >
                      💻 {language === "ar" ? "علوم الحاسب والذكاء الاصطناعي" : "Computer Science & AI"}
                    </button>
                    <button
                      className={`match-option-btn ${quizSelections.major === "Engineering" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("major", "Engineering")}
                    >
                      🔧 {language === "ar" ? "الهندسة والتكنولوجيا" : "Engineering & Technology"}
                    </button>
                    <button
                      className={`match-option-btn ${quizSelections.major === "Business" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("major", "Business")}
                    >
                      💼 {language === "ar" ? "إدارة الأعمال والمالية" : "Business & Economics"}
                    </button>
                    <button
                      className={`match-option-btn ${quizSelections.major === "Pharmacy" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("major", "Pharmacy")}
                    >
                      🧬 {language === "ar" ? "الصيدلة والعلوم الحيوية" : "Pharmacy & Biotech"}
                    </button>
                  </div>
                </div>
              )}

              {matchStep === 2 && (
                <div className="match-step active" data-step="2">
                  <div className="step-label">
                    {language === "ar"
                      ? "الخطوة 2 من 3: اختر موقع الحرم الجامعي المفضل"
                      : "Step 2 of 3: Select your preferred campus location"}
                  </div>
                  <div className="match-options-grid">
                    <button
                      className={`match-option-btn ${quizSelections.city === "Cairo" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("city", "Cairo")}
                    >
                      🏙️ {language === "ar" ? "القاهرة الجديدة والشروق (القاهرة)" : "New Cairo / Shorouk (Cairo)"}
                    </button>
                    <button
                      className={`match-option-btn ${quizSelections.city === "Giza" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("city", "Giza")}
                    >
                      🏜️ {language === "ar" ? "الشيخ زايد وأكتوبر (الجيزة)" : "Sheikh Zayed / 6th October (Giza)"}
                    </button>
                    <button
                      className={`match-option-btn ${quizSelections.city === "any" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("city", "any")}
                    >
                      🌍 {language === "ar" ? "بدون تفضيل / أي مدينة" : "No Preference / Any City"}
                    </button>
                  </div>
                  <button className="match-back-btn" onClick={() => setMatchStep(1)}>
                    ← {language === "ar" ? "رجوع" : "Back"}
                  </button>
                </div>
              )}

              {matchStep === 3 && (
                <div className="match-step active" data-step="3">
                  <div className="step-label">
                    {language === "ar"
                      ? "الخطوة 3 من 3: حدد ميزانية المصروفات السنوية"
                      : "Step 3 of 3: Select your annual tuition budget"}
                  </div>
                  <div className="match-options-grid">
                    <button
                      className={`match-option-btn ${quizSelections.budget === "public" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("budget", "public")}
                    >
                      💵 {language === "ar" ? "حكومية (أقل من 10,000 ج.م)" : "Public (Under 10K EGP)"}
                    </button>
                    <button
                      className={`match-option-btn ${quizSelections.budget === "medium" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("budget", "medium")}
                    >
                      💵 {language === "ar" ? "متوسطة (80,000 – 150,000 ج.م)" : "Mid-Range (80K – 150K EGP)"}
                    </button>
                    <button
                      className={`match-option-btn ${quizSelections.budget === "premium" ? "selected" : ""}`}
                      onClick={() => handleMatchOption("budget", "premium")}
                    >
                      💵 {language === "ar" ? "متميزة (أكثر من 150,000 ج.م)" : "Premium (150K+ EGP)"}
                    </button>
                  </div>
                  <button className="match-back-btn" onClick={() => setMatchStep(2)}>
                    ← {language === "ar" ? "رجوع" : "Back"}
                  </button>
                </div>
              )}

              {matchStep === "results" && (
                <div className="match-step active" data-step="results">
                  <div className="step-label">
                    ✨ {language === "ar" ? "أفضل الجامعات المتوافقة معك:" : "Your Top Matches:"}
                  </div>
                  <div className="match-results-list" id="matchResultsList">
                    {matches.map((match) => (
                      <div
                        key={match.uni.id}
                        className="match-result-item"
                        onClick={() => setSelectedUniModal(match.uni)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="match-result-info">
                          <span className="match-result-emoji">{match.uni.emoji || "🏛️"}</span>
                          <div className="match-result-details">
                            <h4>{getLangField(match.uni, "name")}</h4>
                            <p>
                              📍 {getLangField(match.uni, "location")} · 🏛️ {getLangField(match.uni, "model")}{" "}
                              {language === "ar" ? "نموذج" : "Model"}
                            </p>
                          </div>
                        </div>
                        <div className="match-score-badge">
                          <span>🔥</span>
                          <span>{match.score}% {language === "ar" ? "توافق" : "Match"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="match-reset-btn"
                    onClick={() => {
                      setMatchStep(1);
                      setQuizSelections({ major: null, city: null, budget: null });
                    }}
                  >
                    🔄 {language === "ar" ? "إعادة الاختبار" : "Retake Matcher"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Visual City Explorer Section */}
      <section className="section city-explorer-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge">🗺️ {language === "ar" ? "الموقع الجغرافي" : "Location"}</span>
            <h2>{language === "ar" ? "استكشف الجامعات حسب المدينة" : "Explore by City"}</h2>
            <p>
              {language === "ar"
                ? "ابحث عن المدينة التعليمية والبيئة الجامعية الأنسب لأسلوب حياتك وأهدافك"
                : "Find the perfect university hub for your lifestyle and goals"}
            </p>
          </div>

          <div className="city-explorer-grid">
            {/* New Cairo */}
            <Link href="/universities?search=New Cairo" className="city-card animate-in">
              <div
                className="city-card-bg"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=800')",
                }}
              ></div>
              <div className="city-card-overlay"></div>
              <div className="city-card-content">
                <div className="city-card-icon">🏛️</div>
                <h3>{language === "ar" ? "القاهرة الجديدة والشروق" : "New Cairo"}</h3>
                <p>
                  {language === "ar"
                    ? "المركز الأكبر للجامعات الدولية والألمانية والأمريكية الرائدة ومجمعات الابتكار."
                    : "The modern hub of premium international, German, and American universities."}
                </p>
                <span className="city-card-action">
                  {language === "ar" ? "عرض الجامعات" : "View Universities"}{" "}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Sheikh Zayed & 6th October */}
            <Link href="/universities?search=Zayed" className="city-card animate-in">
              <div
                className="city-card-bg"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=800')",
                }}
              ></div>
              <div className="city-card-overlay"></div>
              <div className="city-card-content">
                <div className="city-card-icon">🌇</div>
                <h3>{language === "ar" ? "الشيخ زايد و 6 أكتوبر" : "Sheikh Zayed & October"}</h3>
                <p>
                  {language === "ar"
                    ? "بيئة تعليمية نابضة بالحياة وحرم جامعي متطور يضم نخبة من جامعات التكنولوجيا والأبحاث."
                    : "Dynamic, vibrant, and packed with thriving student life, research, and tech campuses."}
                </p>
                <span className="city-card-action">
                  {language === "ar" ? "عرض الجامعات" : "View Universities"}{" "}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Alexandria & Coastal */}
            <Link href="/universities?search=Alexandria" className="city-card animate-in">
              <div
                className="city-card-bg"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&q=80&w=800')",
                }}
              ></div>
              <div className="city-card-overlay"></div>
              <div className="city-card-content">
                <div className="city-card-icon">🌊</div>
                <h3>{language === "ar" ? "الإسكندرية والساحل الشمالي" : "Alexandria & North Coast"}</h3>
                <p>
                  {language === "ar"
                    ? "عروس البحر المتوسط التي تجمع بين كبرى الجامعات الحكومية والخاصة والأكاديمية البحرية."
                    : "Historic Mediterranean capital offering renowned public, private, and maritime institutions."}
                </p>
                <span className="city-card-action">
                  {language === "ar" ? "عرض الجامعات" : "View Universities"}{" "}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* National & New Smart Hubs */}
            <Link href="/universities?search=National" className="city-card animate-in">
              <div
                className="city-card-bg"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800')",
                }}
              ></div>
              <div className="city-card-overlay"></div>
              <div className="city-card-content">
                <div className="city-card-icon">🚀</div>
                <h3>{language === "ar" ? "العاصمة الإدارية والجامعات الأهلية" : "New Capital & National Hubs"}</h3>
                <p>
                  {language === "ar"
                    ? "الجيل الجديد من الفروع الدولية والجامعات التكنولوجية والأهلية الحديثة على مستوى الجمهورية."
                    : "Next-generation smart international branch campuses and technological universities across Egypt."}
                </p>
                <span className="city-card-action">
                  {language === "ar" ? "عرض الجامعات" : "View Universities"}{" "}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Suggestions / Recommendations Section */}
      <section className="section recommendations-section" style={{ paddingBottom: "80px" }}>
        <div className="container">
          <div className="section-header text-center animate-in">
            <span className="section-badge">✨ {language === "ar" ? "اقتراحات ذكية" : "AI Suggestions"}</span>
            <h2>{language === "ar" ? "موصى به لك" : "Recommended For You"}</h2>
            <p>
              {language === "ar"
                ? "ترشيحات مخصصة بناءً على محفوظاتك وإشارات تصفحك وتفضيلاتك الدراسية"
                : "Curated matches based on your bookmarks and browsing"}
            </p>
          </div>

          <div className="uni-grid" id="recommendedUnisGrid">
            {recommendations.length > 0 ? (
              recommendations.map((uni: any) => (
                <UniversityCard
                  key={uni.id}
                  university={uni}
                  onViewDetails={(u) => setSelectedUniModal(u)}
                />
              ))
            ) : (
              <p style={{ textAlign: "center", color: "var(--text-muted)", width: "100%" }}>
                {language === "ar"
                  ? "استكشف الجامعات واحفظ مفضلاتك للحصول على ترشيحات مخصصة."
                  : "Explore universities and save bookmarks to get personalized recommendations."}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* University Modal */}
      {selectedUniModal && (
        <UniversityModal
          uni={selectedUniModal}
          onClose={() => setSelectedUniModal(null)}
        />
      )}
    </div>
  );
}
