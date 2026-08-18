"use client";

import React, { useState } from "react";
import type { ScoredUniversity } from "@/lib/majors/interfaces/IMajorMatchEngine";
import type { SlimSearchToken } from "@/types/university.types";
import { MajorTypeFilter, type TypeFilter } from "./MajorTypeFilter";

const DEFAULT_PREVIEW_COUNT = 6;

interface MajorUniListProps {
  /** Pre-scored and pre-sorted list from MajorMatchEngine */
  scoredUniversities: ScoredUniversity[];
  language: "en" | "ar";
  majorId: string;
  majorName: string;
  onSelectUniversity: (u: SlimSearchToken) => void;
}

function getUniName(u: SlimSearchToken, language: "en" | "ar"): string {
  if (language === "ar") return u.nameAr || u.nameEn || "";
  return u.nameEn || u.nameAr || "";
}

function getUniCity(u: SlimSearchToken, language: "en" | "ar"): string {
  if (language === "ar") {
    return (u as any).city_ar || u.city || u.governorate || "مصر";
  }
  return u.city || u.governorate || "Egypt";
}

function getUniTypeLabel(u: SlimSearchToken, language: "en" | "ar"): string {
  const typeMap: Record<string, { en: string; ar: string }> = {
    PUBLIC:        { en: "Public",       ar: "حكومية"   },
    PRIVATE:       { en: "Private",      ar: "خاصة"     },
    NATIONAL:      { en: "National",     ar: "أهلية"    },
    INTERNATIONAL: { en: "International",ar: "دولية"    },
    TECHNOLOGICAL: { en: "Technological",ar: "تكنولوجية"},
  };
  const entry = typeMap[u.type || "PUBLIC"];
  if (!entry) return u.type || "";
  return language === "ar" ? entry.ar : entry.en;
}

/**
 * MajorUniList — Progressive Disclosure University List
 *
 * Displays a ranked list of universities offering a major with:
 *   1. Top N preview (default 6) sorted by confidence score
 *   2. Inline type filter chips (PUBLIC/PRIVATE/NATIONAL)
 *   3. Animated "Show More" expansion
 *   4. "View in Directory" deep-link to filtered university catalog
 *
 * SRP: This component only manages list display and local filter/expand state.
 * It receives pre-scored data and emits selection events.
 */
export function MajorUniList({
  scoredUniversities,
  language,
  majorId,
  majorName,
  onSelectUniversity,
}: MajorUniListProps) {
  const [activeFilter, setActiveFilter] = useState<TypeFilter>("ALL");
  const [showAll, setShowAll] = useState(false);

  // Apply type filter — pure synchronous O(n) — no re-scoring
  const filteredScored = React.useMemo(() => {
    if (activeFilter === "ALL") return scoredUniversities;
    return scoredUniversities.filter(
      (r) => (r.university.type || "PUBLIC") === activeFilter,
    );
  }, [scoredUniversities, activeFilter]);

  const total = filteredScored.length;
  const previewCount = Math.min(DEFAULT_PREVIEW_COUNT, total);
  const visibleScored = showAll ? filteredScored : filteredScored.slice(0, previewCount);
  const hiddenCount = total - previewCount;

  // Reset showAll when filter changes so UI feels consistent
  const handleFilterChange = (filter: TypeFilter) => {
    setActiveFilter(filter);
    setShowAll(false);
  };

  if (total === 0) {
    return (
      <div
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          padding: "12px 0",
          fontStyle: "italic",
        }}
      >
        {language === "ar"
          ? "لا توجد جامعات تطابق هذا التصفية. جرب \"الكل\"."
          : "No universities match this filter. Try \"All\"."}
      </div>
    );
  }

  return (
    <div>
      {/* Inline type filter chips */}
      <MajorTypeFilter
        universities={scoredUniversities.map((r) => r.university)}
        activeFilter={activeFilter}
        language={language}
        onChange={handleFilterChange}
      />

      {/* University rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {visibleScored.map(({ university: u, score, matchedSources }) => (
          <div
            key={u.id || u.slug}
            className="major-uni-item"
            onClick={() => onSelectUniversity(u)}
            style={{ cursor: "pointer" }}
            title={
              process.env.NODE_ENV === "development"
                ? `Score: ${(score * 100).toFixed(0)}% | Sources: ${matchedSources.join(", ")}`
                : undefined
            }
          >
            <div className="major-uni-info">
              <span className="major-uni-emoji">{u.emoji || "🏛️"}</span>
              <div>
                <div className="major-uni-name" style={{ fontWeight: 600 }}>
                  {getUniName(u, language)}
                </div>
                <div className="major-uni-meta" style={{ fontSize: "12px" }}>
                  📍 {getUniCity(u, language)} · 🏛️ {getUniTypeLabel(u, language)}
                </div>
              </div>
            </div>
            <button
              className="view-details-btn"
              style={{ fontSize: "12px", padding: "4px 10px", flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectUniversity(u);
              }}
            >
              {language === "ar" ? "التفاصيل" : "Details"} →
            </button>
          </div>
        ))}
      </div>

      {/* Footer actions: Show More + Directory link */}
      {(hiddenCount > 0 || !showAll) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "12px",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {!showAll && hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--accent-primary, #E11D48)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              {language === "ar"
                ? `▼ عرض المزيد (+${hiddenCount} جامعة)`
                : `▼ Show More (+${hiddenCount} ${hiddenCount === 1 ? "university" : "universities"})`}
            </button>
          )}

          {showAll && total > DEFAULT_PREVIEW_COUNT && (
            <button
              onClick={() => setShowAll(false)}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-muted, #6b7280)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              {language === "ar" ? "▲ إخفاء" : "▲ Show Less"}
            </button>
          )}

          <a
            href={`/universities?search=${encodeURIComponent(majorName)}`}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-muted, #6b7280)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title={
              language === "ar"
                ? "عرض الكل في الدليل مع المقارنة"
                : "See all with full filters and compare"
            }
          >
            {language === "ar" ? "📋 عرض الكل في الدليل" : "📋 View in Directory"} ↗
          </a>
        </div>
      )}
    </div>
  );
}
