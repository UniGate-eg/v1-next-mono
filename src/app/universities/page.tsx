"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { UniversityCard } from "@/components/university/UniversityCard";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";

const parseTuition = (tuitionStr?: string) => {
  if (!tuitionStr) return 0;
  const match = tuitionStr.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
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

export default function UniversitiesPage() {
  const { language, t } = useLanguage();
  const { index: universitiesDatabase, loading } = useUniversitySearch();
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    model: string[];
    type: string[];
    city: string[];
  }>({ model: [], type: [], city: [] });
  const [currentSort, setCurrentSort] = useState("default");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(400000);

  const getLangField = (obj: any, fieldName: string) => {
    if (!obj) return "";
    if (language === "ar" && obj[fieldName + "_ar"]) return obj[fieldName + "_ar"];
    return obj[fieldName] || "";
  };

  const allCities = useMemo(() => {
    const citiesSet = new Set<string>();
    universitiesDatabase.forEach((u: any) => {
      const cityEn = typeof u.city === "string" ? u.city : "";
      const cityAr = typeof u.city_ar === "string" ? u.city_ar : "";
      const cityToUse = language === "ar" && cityAr ? cityAr : cityEn;
      if (cityToUse && cityToUse.trim()) citiesSet.add(cityToUse.trim());
    });
    return Array.from(citiesSet).sort();
  }, [language]);

  const handleFilterToggle = (category: "model" | "type" | "city", value: string) => {
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
    setActiveFilters({ model: [], type: [], city: [] });
    setCurrentSort("default");
    setPriceMin(0);
    setPriceMax(400000);
  };

  const filteredUnis = useMemo(() => {
    let filtered = [...universitiesDatabase];
    const search = searchQuery.trim().toLowerCase();

    if (activeFilters.model.length > 0) {
      filtered = filtered.filter((u: any) =>
        activeFilters.model.includes(u.educationModel)
      );
    }
    if (activeFilters.type.length > 0) {
      filtered = filtered.filter((u: any) =>
        activeFilters.type.includes(u.type)
      );
    }
    if (activeFilters.city.length > 0) {
      filtered = filtered.filter((u: any) =>
        activeFilters.city.includes(u.city)
      );
    }

    if (search) {
      filtered = filtered.filter((u: any) => {
        const nameEn = (u.nameEn || "").toLowerCase();
        const nameAr = (u.nameAr || "").toLowerCase();

        return (
          nameEn.includes(search) ||
          nameAr.includes(search)
        );
      });
    }

    if (currentSort === "name-asc") {
      filtered.sort((a: any, b: any) =>
        (a.nameEn || "").localeCompare(b.nameEn || "")
      );
    } else if (currentSort === "name-desc") {
      filtered.sort((a: any, b: any) =>
        (b.nameEn || "").localeCompare(a.nameEn || "")
      );
    }

    return filtered;
  }, [searchQuery, activeFilters, priceMin, priceMax, currentSort, language, universitiesDatabase]);

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
            {t(
              "Browse and discover Egyptian universities. Filter by model, type, city — or search by name."
            )}
          </p>

          <div className="search-container search-sm animate-in">
            <div className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              id="uniSearchInput"
              placeholder={
                language === "ar"
                  ? "ابحث بالاسم أو التخصص..."
                  : "Search by university name or major…"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filter Panel */}
        <div className="filter-panel animate-in">
          {/* Models */}
          <div className="filter-group">
            <label className="filter-label">{t("Education Model")}</label>
            <div className="filter-chips">
              {modelsList.map((m) => {
                const label = t(m);
                const isSelected = activeFilters.model.includes(label) || activeFilters.model.includes(m);
                return (
                  <button
                    key={m}
                    className={`filter-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => handleFilterToggle("model", label)}
                  >
                    <span>{emojiMap[m] || "🏛️"}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Types */}
          <div className="filter-group">
            <label className="filter-label">{t("Type")}</label>
            <div className="filter-chips">
              {typesList.map((tp) => {
                const label = t(tp);
                const isSelected = activeFilters.type.includes(label) || activeFilters.type.includes(tp);
                return (
                  <button
                    key={tp}
                    className={`filter-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => handleFilterToggle("type", label)}
                  >
                    <span>{emojiMap[tp] || "🏛️"}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cities */}
          {allCities.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">{t("City")}</label>
              <div className="filter-chips">
                {allCities.slice(0, 8).map((city) => {
                  const isSelected = activeFilters.city.includes(city);
                  return (
                    <button
                      key={city}
                      className={`filter-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => handleFilterToggle("city", city)}
                    >
                      <span>📍</span>
                      <span>{city}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort and Clear */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label className="filter-label" style={{ marginBottom: 0 }}>
                {t("Sort")}:
              </label>
              <select
                value={currentSort}
                onChange={(e) => setCurrentSort(e.target.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--bg-glass-strong)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <option value="default">{t("Default")}</option>
                <option value="name-asc">{t("Name A → Z")}</option>
                <option value="name-desc">{t("Name Z → A")}</option>
                <option value="newest">{t("Newest first")}</option>
                <option value="oldest">{t("Oldest first")}</option>
                <option value="tuition-asc">{t("Tuition: Low → High")}</option>
                <option value="tuition-desc">{t("Tuition: High → Low")}</option>
              </select>
            </div>

            <button
              onClick={clearAllFilters}
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {t("Clear all filters")}
            </button>
          </div>
        </div>

        {/* Results count header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 16px" }}>
          <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
            {language === "ar"
              ? `عرض ${filteredUnis.length} من أصل ${universitiesDatabase.length} جامعة`
              : `Showing ${filteredUnis.length} of ${universitiesDatabase.length} universities`}
          </span>
        </div>

        {/* Universities Grid */}
        {filteredUnis.length === 0 ? (
          <div className="empty-state animate-in" style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <h3>{t("No universities found")}</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              {t("Try adjusting your search or filters.")}
            </p>
            <button
              onClick={clearAllFilters}
              className="view-details-btn"
              style={{ marginTop: "20px", display: "inline-block" }}
            >
              {t("Reset all filters")}
            </button>
          </div>
        ) : (
          <div className="unis-grid">
            {filteredUnis.map((uni: any) => (
              <UniversityCard
                key={uni.id}
                university={uni}
                onViewDetails={(u) => setSelectedUniModal(u)}
              />
            ))}
          </div>
        )}
      </div>

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
