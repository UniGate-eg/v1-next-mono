"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { UniversityCard } from "@/components/university/UniversityCard";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";
import { TuitionBudgetFilter } from "@/components/university/TuitionBudgetFilter";
import type { SlimSearchToken } from "@/types/university.types";

const parseTuition = (tuitionStr?: string | number) => {
  if (!tuitionStr) return 0;
  if (typeof tuitionStr === "number") return tuitionStr;
  const match = tuitionStr.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const parseRankScore = (uni: any) => {
  if (!uni) return 99999;
  const qs = (uni.qs_ranking || uni.qsRanking || "").toString().toLowerCase();
  const the = (uni.the_ranking || uni.theRanking || "").toString().toLowerCase();

  if (qs.includes("#1")) return 1;
  if (qs.includes("#2")) return 2;
  if (qs.includes("#3")) return 3;
  if (qs.includes("#4")) return 4;
  if (qs.includes("#5")) return 5;
  if (qs.includes("500") || (parseInt(the) > 0 && parseInt(the) <= 500)) return 500;
  if (qs.includes("700") || qs.includes("800") || (parseInt(the) > 0 && parseInt(the) <= 800)) return 750;
  if (qs.includes("1000") || (parseInt(the) > 0 && parseInt(the) <= 1000)) return 1000;
  if (qs.includes("1200") || qs.includes("1500") || (parseInt(the) > 0 && parseInt(the) <= 1500)) return 1200;
  if (qs.includes("top") || qs.includes("ranked") || (qs !== "" && qs !== "n/a") || (the !== "" && the !== "n/a")) return 1500;
  return 99999;
};

const emojiMap: Record<string, string> = {
  American: "🎓",
  German: "🏛️",
  British: "🏫",
  Egyptian: "🇪🇬",
  Private: "🔒",
  Public: "🏫",
  National: "🏛️",
  Cairo: "🏙️",
  Giza: "🏜️",
  Alexandria: "🌊",
};

const predefinedMajors = [
  { name: "Computer Science", name_ar: "علوم الحاسب", icon: "💻" },
  { name: "Artificial Intelligence", name_ar: "الذكاء الاصطناعي", icon: "🤖" },
  { name: "Engineering", name_ar: "الهندسة والتكنولوجيا", icon: "🔧" },
  { name: "Business Administration", name_ar: "إدارة أعمال", icon: "📊" },
  { name: "Pharmacy", name_ar: "صيدلة", icon: "💊" },
  { name: "Medicine", name_ar: "طب بشري", icon: "🩺" },
  { name: "Dentistry", name_ar: "طب أسنان", icon: "🦷" },
  { name: "Biotechnology", name_ar: "تكنولوجيا حيوية", icon: "🧬" },
  { name: "Applied Arts", name_ar: "فنون تطبيقية", icon: "🎨" },
  { name: "Economics", name_ar: "اقتصاد وعلوم سياسية", icon: "📈" },
];

interface UniversitiesDirectoryClientProps {
  initialUniversities?: SlimSearchToken[];
}

export function UniversitiesDirectoryClient({ initialUniversities = [] }: UniversitiesDirectoryClientProps) {
  const { language, t } = useLanguage();
  const { index: universitiesDatabase } = useUniversitySearch(initialUniversities);
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    model: string[];
    type: string[];
    city: string[];
    major: string[];
  }>({ model: [], type: [], city: [], major: [] });

  const [rankFilter, setRankFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("default");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(400000);

  const allCities = useMemo(() => {
    const citiesSet = new Set<string>();
    universitiesDatabase.forEach((u: any) => {
      const city = u.city || u.governorate;
      if (city && typeof city === "string" && city.trim()) {
        citiesSet.add(city.trim());
      }
    });
    return Array.from(citiesSet).sort();
  }, [universitiesDatabase]);

  const handleFilterToggle = (category: "model" | "type" | "city" | "major", value: string) => {
    setActiveFilters((prev) => {
      const isSelected = prev[category].includes(value);
      if (isSelected) {
        return { ...prev, [category]: prev[category].filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...prev[category], value] };
      }
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveFilters({ model: [], type: [], city: [], major: [] });
    setRankFilter("all");
    setCurrentSort("default");
    setPriceMin(0);
    setPriceMax(400000);
  };

  const filteredUnis = useMemo(() => {
    let filtered = [...universitiesDatabase];
    const search = searchQuery.trim().toLowerCase();

    if (activeFilters.model.length > 0) {
      filtered = filtered.filter((u: any) => {
        const uModel = (u.educationModel || u.model || "").toUpperCase();
        return activeFilters.model.some((m) => uModel.includes(m.toUpperCase()));
      });
    }

    if (activeFilters.type.length > 0) {
      filtered = filtered.filter((u: any) => {
        const uType = (u.type || "").toUpperCase();
        return activeFilters.type.some((t) => uType.includes(t.toUpperCase()));
      });
    }

    if (activeFilters.city.length > 0) {
      filtered = filtered.filter((u: any) => {
        const cityStr = `${u.city || ""} ${u.governorate || ""}`.toLowerCase();
        return activeFilters.city.some((c) => cityStr.includes(c.toLowerCase()));
      });
    }

    if (activeFilters.major.length > 0) {
      filtered = filtered.filter((u: any) => {
        const nameStr = `${u.nameEn || ""} ${u.nameAr || ""}`.toLowerCase();
        return activeFilters.major.some((m) => nameStr.includes(m.toLowerCase()));
      });
    }

    if (rankFilter !== "all") {
      filtered = filtered.filter((u: any) => {
        const score = parseRankScore(u);
        if (rankFilter === "top500") return score <= 500;
        if (rankFilter === "top1000") return score <= 1000;
        if (rankFilter === "ranked-egypt") return score < 99999;
        return true;
      });
    }

    if (priceMin > 0 || priceMax < 400000) {
      filtered = filtered.filter((u: any) => {
        const rawTuition = u.tuition || u.tuitionEgp || (u.type === "PUBLIC" ? 5000 : u.type === "NATIONAL" ? 75000 : 160000);
        const tuition = parseTuition(rawTuition);
        return tuition >= priceMin && tuition <= priceMax;
      });
    }

    if (search) {
      filtered = filtered.filter((u: any) => {
        const nameEn = (u.nameEn || "").toLowerCase();
        const nameAr = (u.nameAr || "").toLowerCase();
        const city = (u.city || "").toLowerCase();
        const gov = (u.governorate || "").toLowerCase();
        const model = (u.educationModel || "").toLowerCase();
        const short = (u.shortName || "").toLowerCase();

        return (
          nameEn.includes(search) ||
          nameAr.includes(search) ||
          city.includes(search) ||
          gov.includes(search) ||
          model.includes(search) ||
          short.includes(search)
        );
      });
    }

    switch (currentSort) {
      case "rank-best":
        filtered.sort((a: any, b: any) => parseRankScore(a) - parseRankScore(b));
        break;
      case "name-asc":
        filtered.sort((a: any, b: any) => (a.nameEn || "").localeCompare(b.nameEn || ""));
        break;
      case "name-desc":
        filtered.sort((a: any, b: any) => (b.nameEn || "").localeCompare(a.nameEn || ""));
        break;
      case "founded-old":
        filtered.sort((a: any, b: any) => (a.established || a.founded || 2000) - (b.established || b.founded || 2000));
        break;
      case "founded-new":
        filtered.sort((a: any, b: any) => (b.established || b.founded || 2000) - (a.established || a.founded || 2000));
        break;
      case "tuition-low":
        filtered.sort((a: any, b: any) => {
          const tA = parseTuition(a.tuition || a.tuitionEgp || (a.type === "PUBLIC" ? 5000 : a.type === "NATIONAL" ? 75000 : 160000));
          const tB = parseTuition(b.tuition || b.tuitionEgp || (b.type === "PUBLIC" ? 5000 : b.type === "NATIONAL" ? 75000 : 160000));
          return tA - tB;
        });
        break;
      case "tuition-high":
        filtered.sort((a: any, b: any) => {
          const tA = parseTuition(a.tuition || a.tuitionEgp || (a.type === "PUBLIC" ? 5000 : a.type === "NATIONAL" ? 75000 : 160000));
          const tB = parseTuition(b.tuition || b.tuitionEgp || (b.type === "PUBLIC" ? 5000 : b.type === "NATIONAL" ? 75000 : 160000));
          return tB - tA;
        });
        break;
      default:
        if (rankFilter !== "all") {
          filtered.sort((a: any, b: any) => parseRankScore(a) - parseRankScore(b));
        }
        break;
    }

    return filtered;
  }, [searchQuery, activeFilters, rankFilter, currentSort, priceMin, priceMax, universitiesDatabase]);

  const getPriceRangeText = () => {
    if (priceMin === 0 && priceMax >= 400000) return t("Any") || "Any";
    if (priceMin === 0) return `${language === "ar" ? "حتى" : "Up to"} ${(priceMax / 1000).toFixed(0)}K`;
    if (priceMax >= 400000) return `${(priceMin / 1000).toFixed(0)}K+`;
    return `${(priceMin / 1000).toFixed(0)}K – ${(priceMax / 1000).toFixed(0)}K`;
  };

  const activeFilterTags = useMemo(() => {
    const tags: Array<{ category: string; value: string; emoji: string; displayValue: string }> = [];
    Object.entries(activeFilters).forEach(([category, values]) => {
      values.forEach((val) => {
        const majorItem = category === "major" ? predefinedMajors.find((c) => c.name === val) : null;
        const displayVal = majorItem ? (language === "ar" ? majorItem.name_ar : majorItem.name) : val;
        const displayEmoji = majorItem ? majorItem.icon : emojiMap[val] || "📍";
        tags.push({ category, value: val, emoji: displayEmoji, displayValue: displayVal });
      });
    });
    if (rankFilter !== "all") {
      tags.push({
        category: "rank",
        value: rankFilter,
        emoji: "🏆",
        displayValue: rankFilter === "top500" ? "Top 500" : rankFilter === "top1000" ? "Top 1000" : "Ranked in Egypt",
      });
    }
    if (priceMin > 0 || priceMax < 400000) {
      tags.push({
        category: "price",
        value: "price",
        emoji: "💰",
        displayValue: getPriceRangeText(),
      });
    }
    if (searchQuery.trim()) {
      tags.push({ category: "search", value: `"${searchQuery.trim()}"`, emoji: "🔍", displayValue: `"${searchQuery.trim()}"` });
    }
    return tags;
  }, [activeFilters, rankFilter, priceMin, priceMax, searchQuery, language]);

  const modelsList = ["American", "German", "British", "Egyptian"];
  const typesList = ["Private", "Public", "National"];

  return (
    <div className="universities-tab-container">
      {/* Page Mini Hero */}
      <div className="page-hero-mini">
        <div className="gradient-orb orb-mini-1"></div>
        <div className="gradient-orb orb-mini-2"></div>
        <div className="container">
          <h1 className="page-title animate-in">{t("All Universities")}</h1>
          <p className="page-subtitle animate-in">
            {t("Browse and discover Egyptian universities. Filter by model, type, city — or search by name.")}
          </p>
        </div>
      </div>

      <div className="container">
        {/* Full Filter Panel */}
        <div className="filter-panel animate-in" id="filterPanel">
          <div className="filter-search-row">
            <div className="search-container search-filter">
              <div className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                id="uniSearchInput"
                placeholder={language === "ar" ? "البحث بالاسم، الموقع، التخصص..." : "Search by name, rank, location…"}
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-sort">
              <label className="sort-label" htmlFor="sortSelect">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4" />
                </svg>
                {t("Sort")}
              </label>
              <select id="sortSelect" className="sort-select" value={currentSort} onChange={(e) => setCurrentSort(e.target.value)}>
                <option value="default">{t("Default")}</option>
                <option value="rank-best">🏆 {language === "ar" ? "الأعلى تصنيفاً أولاً" : "Highest Rank First"}</option>
                <option value="name-asc">{t("Name A → Z")}</option>
                <option value="name-desc">{t("Name Z → A")}</option>
                <option value="founded-old">{t("Oldest first")}</option>
                <option value="founded-new">{t("Newest first")}</option>
                <option value="tuition-low">{t("Tuition: Low → High")}</option>
                <option value="tuition-high">{t("Tuition: High → Low")}</option>
              </select>
            </div>
          </div>

          <div className="filter-groups">
            {/* Education Model Chips */}
            <div className="filter-group">
              <span className="filter-group-label">{t("Education Model")}</span>
              <div className="filter-group-chips">
                {modelsList.map((model) => (
                  <button
                    key={model}
                    className={`filter-chip ${activeFilters.model.includes(model) ? "active" : ""}`}
                    onClick={() => handleFilterToggle("model", model)}
                  >
                    <span className="fc-emoji">{emojiMap[model]}</span> {t(model)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group-divider"></div>

            {/* Type Chips */}
            <div className="filter-group">
              <span className="filter-group-label">{t("Type")}</span>
              <div className="filter-group-chips">
                {typesList.map((type) => (
                  <button
                    key={type}
                    className={`filter-chip ${activeFilters.type.includes(type) ? "active" : ""}`}
                    onClick={() => handleFilterToggle("type", type)}
                  >
                    <span className="fc-emoji">{emojiMap[type]}</span> {t(type)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group-divider"></div>

            {/* City Dropdown */}
            <div className="filter-group">
              <span className="filter-group-label">🏙️ {t("City")}</span>
              <select
                className="sort-select"
                style={{ width: "100%", marginBottom: "8px" }}
                onChange={(e) => {
                  if (e.target.value) {
                    handleFilterToggle("city", e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">{language === "ar" ? "اختر المدينة..." : "Select a city..."}</option>
                {allCities.map((city) => (
                  <option key={city} value={city} disabled={activeFilters.city.includes(city)}>
                    {city}
                  </option>
                ))}
              </select>
              <div className="filter-group-chips">
                {activeFilters.city.map((city) => (
                  <button key={city} className="filter-chip active" onClick={() => handleFilterToggle("city", city)}>
                    <span className="fc-emoji">🏙️</span> {city} ✕
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group-divider"></div>

            {/* World Rank Dropdown */}
            <div className="filter-group">
              <span className="filter-group-label">🏆 {language === "ar" ? "التصنيف العالمي" : "World Rank"}</span>
              <select
                className="sort-select"
                style={{ width: "100%" }}
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
              >
                <option value="all">{language === "ar" ? "جميع التصنيفات" : "All Ranks"}</option>
                <option value="top500">🏆 {language === "ar" ? "أفضل 500 عالمياً" : "Top 500 Global"}</option>
                <option value="top1000">🏅 {language === "ar" ? "أفضل 1000 عالمياً" : "Top 1000 Global"}</option>
                <option value="ranked-egypt">🇪🇬 {language === "ar" ? "مصنفة في مصر" : "Ranked in Egypt"}</option>
              </select>
            </div>

            <div className="filter-group-divider"></div>

            {/* Major Dropdown */}
            <div className="filter-group">
              <span className="filter-group-label">📚 {language === "ar" ? "التخصص" : "Major"}</span>
              <select
                className="sort-select"
                style={{ width: "100%", marginBottom: "10px" }}
                onChange={(e) => {
                  if (e.target.value) {
                    handleFilterToggle("major", e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">{language === "ar" ? "اختر تخصصاً..." : "Select a major..."}</option>
                {predefinedMajors.map((major) => (
                  <option key={major.name} value={major.name} disabled={activeFilters.major.includes(major.name)}>
                    {language === "ar" ? major.name_ar : major.name}
                  </option>
                ))}
              </select>
              <div className="filter-group-chips">
                {activeFilters.major.map((major) => (
                  <button key={major} className="filter-chip active" onClick={() => handleFilterToggle("major", major)}>
                    <span className="fc-emoji">🎓</span> {major} ✕
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modern Tuition Budget Filter Component */}
          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
            <TuitionBudgetFilter
              priceMin={priceMin}
              priceMax={priceMax}
              onPriceChange={(min, max) => {
                setPriceMin(min);
                setPriceMax(max);
              }}
              onReset={() => {
                setPriceMin(0);
                setPriceMax(400000);
              }}
              maxLimit={400000}
            />
          </div>

          {/* Active Filter Tags Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
            <div className="active-filters" id="activeFiltersContainer" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {activeFilterTags.map((tag, idx) => (
                <div key={idx} className="active-filter-tag">
                  <span>
                    {tag.emoji} {tag.displayValue}
                  </span>
                  <span
                    className="remove-tag"
                    onClick={() => {
                      if (tag.category === "search") setSearchQuery("");
                      else if (tag.category === "rank") setRankFilter("all");
                      else if (tag.category === "price") {
                        setPriceMin(0);
                        setPriceMax(400000);
                      } else handleFilterToggle(tag.category as any, tag.value);
                    }}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>

            {(activeFilterTags.length > 0 || searchQuery || currentSort !== "default") && (
              <button className="clear-all-filters-btn" onClick={clearAllFilters}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {t("Clear all")}
              </button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary" id="resultsSummary" style={{ margin: "20px 0", fontSize: "14px", color: "var(--text-muted)" }}>
          {language === "ar"
            ? `تم العثور على ${filteredUnis.length} جامعة`
            : `Showing ${filteredUnis.length} of ${universitiesDatabase.length} universities`}
        </div>

        {/* Universities Grid */}
        <div className="uni-grid uni-grid-full" id="unisGrid">
          {filteredUnis.map((uni: any) => (
            <UniversityCard
              key={uni.id}
              university={uni}
              onViewDetails={() => setSelectedUniModal(uni)}
            />
          ))}
        </div>
      </div>

      {/* University Detail Modal */}
      {selectedUniModal && (
        <UniversityModal
          uni={selectedUniModal}
          onClose={() => setSelectedUniModal(null)}
        />
      )}
    </div>
  );
}
