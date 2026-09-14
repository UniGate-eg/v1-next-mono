"use client";

import React, { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { useViewportPagination } from "@/hooks/useViewportPagination";
import { UniversityCard } from "@/components/university/UniversityCard";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";
import { TuitionBudgetFilter } from "@/components/university/TuitionBudgetFilter";
import { EducationModelIcon } from "@/components/university/EducationModelIcon";
import { formatCity } from "@/lib/utils";
import {
  UNIVERSITY_TYPES,
  UNIVERSITY_TYPE_META,
  normalizeTypeParam,
  toTypeParam,
  countByType,
  type UniversityType,
} from "@/lib/university-type";
import {
  EDUCATION_MODELS,
  EDUCATION_MODEL_META,
  countByEducationModel,
  type EducationModel,
} from "@/lib/education-model";
import { MajorMatchEngine } from "@/lib/majors/engine/MajorMatchEngine";
import { DegreeProgramMatchSource } from "@/lib/majors/engine/DegreeProgramMatchSource";
import { AcademicEntityMatchSource } from "@/lib/majors/engine/AcademicEntityMatchSource";
import { MAJOR_DEFINITIONS } from "@/lib/majors/MajorDefinitions";
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
  Cairo: "🏙️",
  Giza: "🏜️",
  Alexandria: "🌊",
};

interface UniversitiesDirectoryClientProps {
  initialUniversities?: SlimSearchToken[];
}

function UniversitiesDirectoryContent({ initialUniversities = [] }: UniversitiesDirectoryClientProps) {
  const { language, t } = useLanguage();
  const { index: universitiesDatabase } = useUniversitySearch(initialUniversities);
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const parseCsvParam = (value: string | null) => (value ? value.split(",").map((v) => v.trim()).filter(Boolean) : []);

  const [activeFilters, setActiveFilters] = useState<{
    model: EducationModel[];
    type: UniversityType[];
    city: string[];
    major: string[];
  }>(() => ({
    model: [],
    type: normalizeTypeParam(searchParams.get("type")),
    city: parseCsvParam(searchParams.get("city")),
    major: parseCsvParam(searchParams.get("major")),
  }));

  const appliedCityParamRef = useRef<string | null>(searchParams.get("city"));
  const appliedTypeParamRef = useRef<string | null>(searchParams.get("type"));
  const appliedMajorParamRef = useRef<string | null>(searchParams.get("major"));

  useEffect(() => {
    const cityParam = searchParams.get("city");
    if (cityParam && appliedCityParamRef.current !== cityParam) {
      appliedCityParamRef.current = cityParam;
      const cities = parseCsvParam(cityParam);
      setActiveFilters((prev) => ({ ...prev, city: Array.from(new Set([...prev.city, ...cities])) }));
    }

    const typeParam = searchParams.get("type");
    if (typeParam !== null && appliedTypeParamRef.current !== typeParam) {
      appliedTypeParamRef.current = typeParam;
      const types = normalizeTypeParam(typeParam);
      setActiveFilters((prev) => ({ ...prev, type: types }));
    }

    const majorParam = searchParams.get("major");
    if (majorParam && appliedMajorParamRef.current !== majorParam) {
      appliedMajorParamRef.current = majorParam;
      const majors = parseCsvParam(majorParam);
      setActiveFilters((prev) => ({ ...prev, major: Array.from(new Set([...prev.major, ...majors])) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [rankFilter, setRankFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("default");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(400000);

  const typeCounts = useMemo(() => countByType(universitiesDatabase), [universitiesDatabase]);
  const countMap = useMemo(
    () => Object.fromEntries(typeCounts.map((tc) => [tc.type, tc.count])) as Record<UniversityType, number>,
    [typeCounts]
  );

  const modelCounts = useMemo(() => countByEducationModel(universitiesDatabase), [universitiesDatabase]);
  const modelCountMap = useMemo(
    () => Object.fromEntries(modelCounts.map((mc) => [mc.model, mc.count])) as Record<EducationModel, number>,
    [modelCounts]
  );

  // Matches the same academic-entity engine used on /majors — degree programs
  // and faculty/department names, not university display names.
  const majorEngine = useMemo(
    () => new MajorMatchEngine([new DegreeProgramMatchSource(), new AcademicEntityMatchSource()]),
    []
  );

  const matchedUniIdsByMajorId = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const major of MAJOR_DEFINITIONS) {
      const matches = majorEngine.getMatches(universitiesDatabase as SlimSearchToken[], major);
      map.set(major.id, new Set(matches.map((m) => m.university.id)));
    }
    return map;
  }, [universitiesDatabase, majorEngine]);

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

  const handleModelToggle = (model: EducationModel) => {
    setActiveFilters((prev) => {
      const isSelected = prev.model.includes(model);
      const nextModels = isSelected
        ? prev.model.filter((m) => m !== model)
        : [...prev.model, model];
      return { ...prev, model: nextModels };
    });
  };

  const handleFilterToggle = (category: "city" | "major", value: string) => {
    setActiveFilters((prev) => {
      const isSelected = prev[category].includes(value);
      if (isSelected) {
        return { ...prev, [category]: prev[category].filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...prev[category], value] };
      }
    });
  };

  const handleTypeToggle = (type: UniversityType) => {
    setActiveFilters((prev) => {
      const isSelected = prev.type.includes(type);
      const nextTypes = isSelected
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type];

      const params = new URLSearchParams(window.location.search);
      const paramVal = toTypeParam(nextTypes);
      if (paramVal) {
        params.set("type", paramVal);
      } else {
        params.delete("type");
      }
      const newUrl = params.toString() ? `/universities?${params.toString()}` : "/universities";
      window.history.replaceState(null, "", newUrl);

      return { ...prev, type: nextTypes };
    });
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveFilters({ model: [], type: [], city: [], major: [] });
    setRankFilter("all");
    setCurrentSort("default");
    setPriceMin(0);
    setPriceMax(400000);
    window.history.replaceState(null, "", "/universities");
  };

  const filteredUnis = useMemo(() => {
    let filtered = [...universitiesDatabase];
    const search = searchQuery.trim().toLowerCase();

    if (activeFilters.model.length > 0) {
      filtered = filtered.filter((u: any) => activeFilters.model.includes(u.educationModel as EducationModel));
    }

    if (activeFilters.type.length > 0) {
      filtered = filtered.filter((u: any) => activeFilters.type.includes(u.type as UniversityType));
    }

    if (activeFilters.city.length > 0) {
      filtered = filtered.filter((u: any) => {
        const cityStr = `${u.city || ""} ${u.governorate || ""}`.toLowerCase();
        return activeFilters.city.some((c) => cityStr.includes(c.toLowerCase()));
      });
    }

    if (activeFilters.major.length > 0) {
      filtered = filtered.filter((u: any) =>
        activeFilters.major.some((majorId) => matchedUniIdsByMajorId.get(majorId)?.has(u.id))
      );
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
  }, [searchQuery, activeFilters, rankFilter, currentSort, priceMin, priceMax, universitiesDatabase, matchedUniIdsByMajorId]);

  const {
    visibleItems: visibleUnis,
    hasMore,
    isLoadingMore,
    newlyRevealedCount,
    sentinelRef,
  } = useViewportPagination(filteredUnis, 24);

  const getPriceRangeText = () => {
    if (priceMin === 0 && priceMax >= 400000) return t("Any") || "Any";
    if (priceMin === 0) return `${language === "ar" ? "حتى" : "Up to"} ${(priceMax / 1000).toFixed(0)}K`;
    if (priceMax >= 400000) return `${(priceMin / 1000).toFixed(0)}K+`;
    return `${(priceMin / 1000).toFixed(0)}K – ${(priceMax / 1000).toFixed(0)}K`;
  };

  const activeFilterTags = useMemo(() => {
    const tags: Array<{ category: string; value: string; emoji: React.ReactNode; displayValue: string }> = [];
    activeFilters.model.forEach((val) => {
      const meta = EDUCATION_MODEL_META[val];
      tags.push({ category: "model", value: val, emoji: <EducationModelIcon model={val} />, displayValue: meta[language] });
    });
    activeFilters.type.forEach((val) => {
      const meta = UNIVERSITY_TYPE_META[val];
      tags.push({ category: "type", value: val, emoji: meta.icon, displayValue: meta[language] });
    });
    activeFilters.city.forEach((val) => {
      tags.push({ category: "city", value: val, emoji: "🏙️", displayValue: formatCity(val, language) });
    });
    activeFilters.major.forEach((val) => {
      const majorItem = MAJOR_DEFINITIONS.find((c) => c.id === val);
      const displayVal = majorItem ? (language === "ar" ? majorItem.name_ar : majorItem.name) : val;
      const displayEmoji = majorItem ? majorItem.icon : "📚";
      tags.push({ category: "major", value: val, emoji: displayEmoji, displayValue: displayVal });
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  const q = e.target.value.trim();
                  if (q.length >= 2) {
                    searchDebounceRef.current = setTimeout(() => {
                      posthog.capture("university_searched", { query_length: q.length });
                    }, 800);
                  }
                }}
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
                {EDUCATION_MODELS.map((model) => {
                  const count = modelCountMap[model] ?? 0;
                  const isSelected = activeFilters.model.includes(model);
                  if (count === 0 && !isSelected) return null;
                  const meta = EDUCATION_MODEL_META[model];
                  return (
                    <button
                      key={model}
                      className={`filter-chip ${isSelected ? "active" : ""}`}
                      onClick={() => handleModelToggle(model)}
                    >
                      <span className="fc-emoji"><EducationModelIcon model={model} /></span> {meta[language]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-group-divider"></div>

            {/* Type Chips */}
            <div className="filter-group">
              <span className="filter-group-label">{t("Type")}</span>
              <div className="filter-group-chips">
                {UNIVERSITY_TYPES.map((type) => {
                  const count = countMap[type] ?? 0;
                  const isSelected = activeFilters.type.includes(type);
                  if (count === 0 && !isSelected) return null;
                  const meta = UNIVERSITY_TYPE_META[type];
                  return (
                    <button
                      key={type}
                      className={`filter-chip ${isSelected ? "active" : ""}`}
                      onClick={() => handleTypeToggle(type)}
                    >
                      <span className="fc-emoji">{meta.icon}</span> {meta[language]} ({count})
                    </button>
                  );
                })}
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
                    {formatCity(city, language)}
                  </option>
                ))}
              </select>
              <div className="filter-group-chips">
                {activeFilters.city.map((city) => (
                  <button key={city} className="filter-chip active" onClick={() => handleFilterToggle("city", city)}>
                    <span className="fc-emoji">🏙️</span> {formatCity(city, language)} ✕
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
                {MAJOR_DEFINITIONS.map((major) => (
                  <option key={major.id} value={major.id} disabled={activeFilters.major.includes(major.id)}>
                    {language === "ar" ? major.name_ar : major.name}
                  </option>
                ))}
              </select>
              <div className="filter-group-chips">
                {activeFilters.major.map((majorId) => {
                  const majorItem = MAJOR_DEFINITIONS.find((m) => m.id === majorId);
                  const label = majorItem ? (language === "ar" ? majorItem.name_ar : majorItem.name) : majorId;
                  return (
                    <button key={majorId} className="filter-chip active" onClick={() => handleFilterToggle("major", majorId)}>
                      <span className="fc-emoji">🎓</span> {label} ✕
                    </button>
                  );
                })}
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
                      } else if (tag.category === "type") {
                        handleTypeToggle(tag.value as UniversityType);
                      } else if (tag.category === "model") {
                        handleModelToggle(tag.value as EducationModel);
                      } else {
                        handleFilterToggle(tag.category as "city" | "major", tag.value);
                      }
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

        {/* Universities Grid / Empty State */}
        {filteredUnis.length === 0 ? (
          <div className="py-16 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 my-6">
            <div className="text-4xl">🏛️</div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {activeFilters.type.length > 0 && activeFilters.type.every((t) => (countMap[t] ?? 0) === 0)
                ? language === "ar"
                  ? `لا توجد جامعات ${activeFilters.type.map((t) => UNIVERSITY_TYPE_META[t].ar).join(" / ")} مدرجة حالياً.`
                  : `No ${activeFilters.type.map((t) => UNIVERSITY_TYPE_META[t].en).join(" / ")} universities are listed yet.`
                : language === "ar"
                ? "لم يتم العثور على أي جامعات تطابق معايير البحث"
                : "No universities matched your search criteria"}
            </h3>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {language === "ar" ? "عرض كل الجامعات" : "View all universities"}
            </button>
          </div>
        ) : (
          <>
            <div className="uni-grid uni-grid-full" id="unisGrid">
              {visibleUnis.map((uni: any, idx: number) => {
                const firstNewIndex = visibleUnis.length - newlyRevealedCount;
                const isNewlyRevealed = idx >= firstNewIndex;
                const staggerIndex = idx - firstNewIndex;
                return (
                  <UniversityCard
                    key={uni.id}
                    university={uni}
                    className={isNewlyRevealed ? "uni-card-page-enter" : ""}
                    style={isNewlyRevealed ? { animationDelay: `${Math.min(staggerIndex, 12) * 40}ms` } : undefined}
                    onViewDetails={() => {
                      posthog.capture("university_card_viewed", {
                        university_id: String(uni.id),
                        university_type: uni.type,
                        university_city: uni.city || uni.governorate,
                      });
                      setSelectedUniModal(uni);
                    }}
                  />
                );
              })}
            </div>
            {hasMore && (
              <div ref={sentinelRef} className="pagination-sentinel" aria-hidden="true">
                {isLoadingMore && (
                  <div className="pagination-loading-more">
                    <span className="pagination-dot" />
                    <span className="pagination-dot" />
                    <span className="pagination-dot" />
                    <span className="pagination-loading-text">
                      {language === "ar" ? "جارٍ تحميل المزيد من الجامعات..." : "Loading more universities…"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
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

export function UniversitiesDirectoryClient(props: UniversitiesDirectoryClientProps) {
  return (
    <Suspense fallback={null}>
      <UniversitiesDirectoryContent {...props} />
    </Suspense>
  );
}
