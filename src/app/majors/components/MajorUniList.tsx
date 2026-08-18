"use client";

import React, { useState, useMemo } from "react";
import type { ScoredUniversity } from "@/lib/majors/interfaces/IMajorMatchEngine";
import type { SlimSearchToken } from "@/types/university.types";
import { MajorTypeFilter, type TypeFilter } from "./MajorTypeFilter";

const INITIAL_PREVIEW_COUNT = 6;
const STEP_INCREMENT = 10;

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
    PUBLIC: { en: "Public", ar: "حكومية" },
    PRIVATE: { en: "Private", ar: "خاصة" },
    NATIONAL: { en: "National", ar: "أهلية" },
    INTERNATIONAL: { en: "International", ar: "دولية" },
    TECHNOLOGICAL: { en: "Technological", ar: "تكنولوجية" },
  };
  const entry = typeMap[u.type || "PUBLIC"];
  if (!entry) return u.type || "";
  return language === "ar" ? entry.ar : entry.en;
}

/**
 * MajorUniList — Progressive Disclosure University List
 *
 * Displays a ranked list of universities offering a major with:
 *   1. Type filter tabs (All, Public, Private, National, etc.)
 *   2. Fast inline search bar for majors with > 8 institutions
 *   3. Stepwise pagination (Initial 6 -> +10 increments)
 *   4. "View in Directory" deep-link
 */
export function MajorUniList({
  scoredUniversities,
  language,
  majorId,
  majorName,
  onSelectUniversity,
}: MajorUniListProps) {
  const [activeFilter, setActiveFilter] = useState<TypeFilter>("ALL");
  const [filterQuery, setFilterQuery] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_PREVIEW_COUNT);

  // 1. Filter by University Type (Public / Private / National)
  const typeFiltered = useMemo(() => {
    if (activeFilter === "ALL") return scoredUniversities;
    return scoredUniversities.filter(
      (r) => (r.university.type || "PUBLIC") === activeFilter,
    );
  }, [scoredUniversities, activeFilter]);

  // 2. Filter by Inline Sub-Search (Name, City, Governorate, or ShortCode)
  const searchFiltered = useMemo(() => {
    if (!filterQuery.trim()) return typeFiltered;
    const q = filterQuery.toLowerCase().trim();
    return typeFiltered.filter((r) => {
      const u = r.university;
      const nameEn = (u.nameEn || "").toLowerCase();
      const nameAr = (u.nameAr || "");
      const shortName = (u.shortName || "").toLowerCase();
      const city = (u.city || "").toLowerCase();
      const gov = (u.governorate || "").toLowerCase();
      return (
        nameEn.includes(q) ||
        nameAr.includes(q) ||
        shortName.includes(q) ||
        city.includes(q) ||
        gov.includes(q)
      );
    });
  }, [typeFiltered, filterQuery]);

  const total = searchFiltered.length;
  const visibleScored = searchFiltered.slice(0, visibleLimit);
  const remainingCount = Math.max(0, total - visibleLimit);

  // Reset pagination when type filter or search query changes
  const handleFilterChange = (filter: TypeFilter) => {
    setActiveFilter(filter);
    setVisibleLimit(INITIAL_PREVIEW_COUNT);
  };

  const handleSearchChange = (val: string) => {
    setFilterQuery(val);
    setVisibleLimit(INITIAL_PREVIEW_COUNT);
  };

  const handleShowMore = () => {
    setVisibleLimit((prev) => prev + STEP_INCREMENT);
  };

  const handleShowAll = () => {
    setVisibleLimit(total);
  };

  const handleShowLess = () => {
    setVisibleLimit(INITIAL_PREVIEW_COUNT);
  };

  return (
    <div>
      {/* Inline type filter chips */}
      <MajorTypeFilter
        universities={scoredUniversities.map((r) => r.university)}
        activeFilter={activeFilter}
        language={language}
        onChange={handleFilterChange}
      />

      {/* Inline Sub-Search for High-Volume Majors (> 8 results) */}
      {scoredUniversities.length > 8 && (
        <div style={{ marginBottom: "10px", position: "relative" }}>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              language === "ar"
                ? "🔍 ابحث بالاسم أو المدينة (مثال: القاهرة، الجيزة، الإسكندرية)..."
                : "🔍 Filter by university name or city (e.g. Cairo, GUC, Alexandria)..."
            }
            style={{
              width: "100%",
              padding: "6px 12px",
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle, #e5e7eb)",
              background: "var(--surface-elevated, #fff)",
              color: "var(--text-primary, #111827)",
              outline: "none",
            }}
          />
          {filterQuery && (
            <button
              onClick={() => handleSearchChange("")}
              style={{
                position: "absolute",
                right: language === "ar" ? "auto" : "8px",
                left: language === "ar" ? "8px" : "auto",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted, #9ca3af)",
                cursor: "pointer",
                fontSize: "12px",
                padding: "2px 4px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Zero match state */}
      {total === 0 && (
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            padding: "16px 0",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {language === "ar"
            ? "لا توجد نتائج تطابق هذا البحث. جرب كلمة أخرى أو اختر \"الكل\"."
            : "No universities match your filter. Try another keyword or select \"All\"."}
        </div>
      )}

      {/* University rows */}
      {total > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {visibleScored.map(({ university: u, score, matchedSources }) => {
            const hasRanking = Boolean(u.qsRanking && u.qsRanking !== "N/A");

            return (
              <div
                key={u.id || u.slug}
                className="major-uni-item"
                onClick={() => onSelectUniversity(u)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle, #f3f4f6)",
                  transition: "background 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div className="major-uni-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="major-uni-emoji" style={{ fontSize: "20px" }}>
                    {u.emoji || "🏛️"}
                  </span>
                  <div>
                    <div className="major-uni-name" style={{ fontWeight: 600, fontSize: "13.5px" }}>
                      {getUniName(u, language)}
                      {u.shortName && (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", marginInlineStart: "6px" }}>
                          ({u.shortName})
                        </span>
                      )}
                    </div>
                    <div className="major-uni-meta" style={{ fontSize: "11.5px", color: "var(--text-secondary, #6b7280)", marginTop: "2px" }}>
                      📍 {getUniCity(u, language)} · 🏛️ {getUniTypeLabel(u, language)}
                      {hasRanking && (
                        <span
                          style={{
                            marginInlineStart: "6px",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            background: "rgba(225, 29, 72, 0.08)",
                            color: "var(--accent-primary, #E11D48)",
                            fontSize: "10px",
                            fontWeight: 600,
                          }}
                        >
                          ⭐ Top Ranked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className="view-details-btn"
                  style={{
                    fontSize: "11.5px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUniversity(u);
                  }}
                >
                  {language === "ar" ? "التفاصيل" : "Details"} →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer controls: Stepwise Pagination & Directory Deep Link */}
      {total > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "12px",
            paddingTop: "8px",
            borderTop: "1px dashed var(--border-subtle, #e5e7eb)",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {/* Pagination buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {remainingCount > 0 && (
              <button
                onClick={handleShowMore}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--accent-primary, #E11D48)",
                  background: "rgba(225, 29, 72, 0.06)",
                  border: "1px solid rgba(225, 29, 72, 0.2)",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {language === "ar"
                  ? `▼ عرض المزيد (+${Math.min(STEP_INCREMENT, remainingCount)})`
                  : `▼ Show More (+${Math.min(STEP_INCREMENT, remainingCount)})`}
              </button>
            )}

            {remainingCount > STEP_INCREMENT && (
              <button
                onClick={handleShowAll}
                style={{
                  fontSize: "11.5px",
                  color: "var(--text-muted, #6b7280)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {language === "ar" ? `عرض الكل (${total})` : `Show all (${total})`}
              </button>
            )}

            {visibleLimit > INITIAL_PREVIEW_COUNT && (
              <button
                onClick={handleShowLess}
                style={{
                  fontSize: "11.5px",
                  color: "var(--text-muted, #6b7280)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {language === "ar" ? "▲ إخفاء" : "▲ Show Less"}
              </button>
            )}
          </div>

          {/* Directory Deep-Link Button */}
          <a
            href={`/universities?search=${encodeURIComponent(majorName)}`}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-secondary, #4b5563)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title={
              language === "ar"
                ? "عرض الكل في دليل الجامعات مع المقارنة والتصفية"
                : "Explore all in Directory with compare tools and tuition filters"
            }
          >
            {language === "ar" ? "📋 فتح في الدليل الكامل" : "📋 View in Directory"} ↗
          </a>
        </div>
      )}
    </div>
  );
}
