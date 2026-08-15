"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { universitiesDatabase } from "@/data/database";
import { UniversityCard } from "@/components/university/UniversityCard";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";

const newsItems = [
  {
    id: 1,
    title: "Nile University Opens State-of-the-Art AI Research Center",
    title_ar: "جامعة النيل تفتتح مركزاً متطوراً لأبحاث الذكاء الاصطناعي",
    excerpt:
      "The new center will focus on machine learning, natural language processing, and robotics, aiming to position Egypt as a regional AI hub.",
    excerpt_ar:
      "سيركز المركز الجديد على تعلم الآلة ومعالجة اللغات الطبيعية والروبوتات، بهدف جعل مصر مركزاً إقليمياً للذكاء الاصطناعي.",
    date: "July 12, 2026",
    date_ar: "12 يوليو 2026",
    category: "Research",
    category_ar: "بحث علمي",
    emoji: "🤖",
    university: "Nile University",
    university_ar: "جامعة النيل",
    gradient: "linear-gradient(135deg, #E11D48, #99582a)",
    categoryColor: "rgba(187, 107, 0, 0.2)",
    categoryText: "var(--accent-sage)",
  },
  {
    id: 2,
    title: "AUC Announces Full Scholarship Program for 2027 Intake",
    title_ar: "الجامعة الأمريكية تعلن عن برنامج منح دراسية كاملة لعام 2027",
    excerpt:
      "The American University in Cairo will offer 50 full-ride scholarships to exceptional Egyptian students from public schools across all governorates.",
    excerpt_ar:
      "ستقدم الجامعة الأمريكية بالقاهرة 50 منحة دراسية كاملة للطلاب المصريين المتفوقين من المدارس الحكومية في جميع المحافظات.",
    date: "July 8, 2026",
    date_ar: "8 يوليو 2026",
    category: "Scholarships",
    category_ar: "منح دراسية",
    emoji: "🎓",
    university: "AUC",
    university_ar: "الجامعة الأمريكية بالقاهرة",
    gradient: "linear-gradient(135deg, #bb9457, #ffe6a7)",
    categoryColor: "rgba(105, 5, 0, 0.2)",
    categoryText: "var(--accent-sand)",
  },
  {
    id: 3,
    title: "GUC Partners with TU Munich for Dual-Degree Engineering Program",
    title_ar: "الجامعة الألمانية تتعاون مع جامعة ميونخ لبرنامج هندسة مزدوج الدرجة",
    excerpt:
      "Students in the new program will spend two years in Cairo and two in Munich, earning degrees from both universities.",
    excerpt_ar:
      "سيقضي الطلاب في البرنامج الجديد عامين في القاهرة وعامين في ميونخ، وسيحصلون على شهادات من كلتا الجامعتين.",
    date: "July 3, 2026",
    date_ar: "3 يوليو 2026",
    category: "Programs",
    category_ar: "برامج",
    emoji: "🇩🇪",
    university: "GUC",
    university_ar: "الجامعة الألمانية بالقاهرة",
    gradient: "linear-gradient(135deg, #99582a, #bb9457)",
    categoryColor: "rgba(147, 75, 0, 0.2)",
    categoryText: "var(--accent-terracotta)",
  },
];

export default function HomePage() {
  const { language, t } = useLanguage();
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);

  // Search state
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

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
    if (language === "ar" && obj[field + "_ar"]) return obj[field + "_ar"];
    return obj[field] || "";
  };

  const getLangArray = (obj: any, field: string): string[] => {
    if (!obj) return [];
    if (language === "ar" && obj[field + "_ar"]) return obj[field + "_ar"];
    return obj[field] || [];
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
      const uMajors = getLangArray(u, "majors");

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

      uMajors.forEach((m: string) => {
        if (m && m.toLowerCase().includes(qLower) && !results.some((r) => r.text === m)) {
          results.push({
            type: "major",
            id: u.id,
            text: m,
            icon: "🎓",
            secondary: uName,
            uniData: u,
          });
        }
      });
    });

    return results.slice(0, 8);
  }, [heroSearchQuery, language]);

  const parseTuition = (tuitionStr?: string) => {
    if (!tuitionStr) return 0;
    const match = tuitionStr.replace(/,/g, "").match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

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
    const calculated = universitiesDatabase.map((uni: any) => {
      let score = 0;

      const hasMajor = getLangArray(uni, "majors")
        .filter(Boolean)
        .some((m: string) => m.toLowerCase().includes((selections.major || "").toLowerCase()));
      if (hasMajor) score += 40;

      if (selections.city === "any") {
        score += 30;
      } else if (
        getLangField(uni, "city").toLowerCase().includes((selections.city || "").toLowerCase()) ||
        getLangField(uni, "location").toLowerCase().includes((selections.city || "").toLowerCase())
      ) {
        score += 30;
      }

      const tuitionVal = parseTuition(getLangField(uni, "tuition"));
      if (selections.budget === "public") {
        if (tuitionVal < 10000) score += 30;
        else if (tuitionVal <= 100000) score += 10;
      } else if (selections.budget === "medium") {
        if (tuitionVal >= 10000 && tuitionVal <= 150000) score += 30;
        else if (tuitionVal < 10000) score += 20;
      } else if (selections.budget === "premium") {
        if (tuitionVal > 150000) score += 30;
        else if (tuitionVal >= 10000 && tuitionVal <= 150000) score += 15;
      }

      return { uni, score };
    });

    calculated.sort((a, b) => b.score - a.score);
    setMatches(calculated.slice(0, 3));
    setMatchStep("results");
  };

  const featuredUnis = useMemo(() => {
    return universitiesDatabase.filter((u: any) => u.featured).slice(0, 6);
  }, []);

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

      {/* Featured Universities Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🏛️ {language === "ar" ? "جامعات مميزة" : "Featured"}</span>
            <h2>{language === "ar" ? "أبرز الجامعات في مصر" : "Featured Egyptian Universities"}</h2>
            <p>
              {language === "ar"
                ? "استكشف الجامعات الأكثر إقبالاً بتصنيفاتها ومصروفاتها ونقاط قوتها."
                : "Explore top higher education institutions across Egypt with accredited programs."}
            </p>
          </div>

          <div className="unis-grid">
            {featuredUnis.map((uni: any) => (
              <UniversityCard
                key={uni.id}
                university={uni}
                onViewDetails={(u) => setSelectedUniModal(u)}
              />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link
              href="/universities"
              className="view-details-btn"
              style={{
                display: "inline-flex",
                padding: "12px 32px",
                fontSize: "15px",
                background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                color: "#fff",
              }}
            >
              {language === "ar" ? "عرض جميع الجامعات (30+)" : "View All Universities (30+)"} →
            </Link>
          </div>
        </div>
      </section>

      {/* University News Section */}
      <section className="section news-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">📰 {language === "ar" ? "آخر المستجدات" : "Latest Updates"}</span>
            <h2>{language === "ar" ? "أخبار وتحديثات الجامعات" : "University News"}</h2>
            <p>
              {language === "ar"
                ? "تابع أحدث المنح الدراسية والبرامج الأكاديمية والمراكز البحثية الجديدة."
                : "Stay informed with the latest announcements and scholarship opportunities"}
            </p>
          </div>
          <div className="news-grid">
            {newsItems.map((news) => (
              <div key={news.id} className="news-card animate-in">
                <div className="news-card-image">
                  <div className="news-card-gradient" style={{ background: news.gradient }}>
                    <span
                      style={{
                        position: "relative",
                        zIndex: 2,
                        fontSize: "48px",
                        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                      }}
                    >
                      {news.emoji}
                    </span>
                  </div>
                  <span
                    className="news-card-category"
                    style={{ background: news.categoryColor, color: news.categoryText }}
                  >
                    {getLangField(news, "category")}
                  </span>
                </div>
                <div className="news-card-body">
                  <div className="news-card-date">📅 {getLangField(news, "date")}</div>
                  <h3 className="news-card-title">{getLangField(news, "title")}</h3>
                  <p className="news-card-excerpt">{getLangField(news, "excerpt")}</p>
                  <span className="news-card-uni">🏛️ {getLangField(news, "university")}</span>
                </div>
              </div>
            ))}
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
