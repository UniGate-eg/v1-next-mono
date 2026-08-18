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
 * MajorUniList — Progressive Disclosure University List (Dark Glassmorphism)
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
  const [hoveredUniId, setHoveredUniId] = useState<string | null>(null);

  // 1. Filter by University Type
  const typeFiltered = useMemo(() => {
    if (activeFilter === "ALL") return scoredUniversities;
    return scoredUniversities.filter(
      (r) => (r.university.type || "PUBLIC") === activeFilter,
    );
  }, [scoredUniversities, activeFilter]);

  // 2. Filter by Inline Sub-Search
  const searchFiltered = useMemo(() => {
    if (!filterQuery.trim()) return typeFiltered;
    const q = filterQuery.toLowerCase().trim();
    return typeFiltered.filter((r) => {
      const u = r.university;
      const nameEn = (u.nameEn || "").toLowerCase();
      const nameAr = u.nameAr || "";
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
        <div style={{ marginBottom: "12px", position: "relative" }}>
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
              padding: "8px 14px",
              fontSize: "12.5px",
              borderRadius: "var(--radius-sm, 10px)",
              border: "1px solid var(--border, rgba(168, 85, 247, 0.22))",
              background: "rgba(10, 11, 30, 0.65)",
              color: "var(--text-primary, #FFFFFF)",
              backdropFilter: "blur(12px)",
              outline: "none",
              transition: "border-color var(--transition-fast, 0.2s ease)",
            }}
          />
          {filterQuery && (
            <button
              onClick={() => handleSearchChange("")}
              style={{
                position: "absolute",
                right: language === "ar" ? "auto" : "10px",
                left: language === "ar" ? "10px" : "auto",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted, #A0AEC0)",
                cursor: "pointer",
                fontSize: "11px",
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
            color: "var(--text-muted, #A0AEC0)",
            padding: "20px 0",
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
        <div
          className="major-uni-list-scrollable"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            maxHeight: visibleLimit > INITIAL_PREVIEW_COUNT ? "440px" : "none",
            overflowY: visibleLimit > INITIAL_PREVIEW_COUNT ? "auto" : "visible",
            paddingRight: visibleLimit > INITIAL_PREVIEW_COUNT ? "4px" : "0",
            paddingBottom: "2px",
          }}
        >
          {visibleScored.map(({ university: u }) => {
            const isHovered = hoveredUniId === (u.id || u.slug);
            const hasRanking = Boolean(u.qsRanking && u.qsRanking !== "N/A");

            return (
              <div
                key={u.id || u.slug}
                className="major-uni-item"
                onMouseEnter={() => setHoveredUniId(u.id || u.slug)}
                onMouseLeave={() => setHoveredUniId(null)}
                onClick={() => onSelectUniversity(u)}
                style={{
                  cursor: "pointer",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm, 10px)",
                  background: isHovered
                    ? "rgba(124, 58, 237, 0.12)"
                    : "rgba(255, 255, 255, 0.02)",
                  border: isHovered
                    ? "1px solid rgba(192, 132, 252, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.05)",
                  transition: "all var(--transition-fast, 0.2s ease)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="major-uni-info"
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    className="major-uni-emoji"
                    style={{
                      fontSize: "22px",
                      filter: isHovered ? "drop-shadow(0 0 8px rgba(124, 58, 237, 0.6))" : "none",
                      transition: "filter 0.2s ease",
                    }}
                  >
                    {u.emoji || "🏛️"}
                  </span>
                  <div>
                    <div
                      className="major-uni-name"
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: isHovered ? "#FFFFFF" : "var(--text-secondary, #E2E8F0)",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {getUniName(u, language)}
                      {u.shortName && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted, #A0AEC0)",
                            marginInlineStart: "6px",
                            fontWeight: 400,
                          }}
                        >
                          ({u.shortName})
                        </span>
                      )}
                    </div>
                    <div
                      className="major-uni-meta"
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted, #A0AEC0)",
                        marginTop: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>📍 {getUniCity(u, language)}</span>
                      <span>·</span>
                      <span>🏛️ {getUniTypeLabel(u, language)}</span>
                      {hasRanking && (
                        <span
                          style={{
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background: "rgba(251, 191, 36, 0.12)",
                            border: "1px solid rgba(251, 191, 36, 0.3)",
                            color: "var(--accent-gold, #FCD34D)",
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
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full, 999px)",
                    background: isHovered
                      ? "linear-gradient(135deg, rgba(124, 58, 237, 0.5), rgba(236, 72, 153, 0.5))"
                      : "rgba(124, 58, 237, 0.15)",
                    border: "1px solid rgba(168, 85, 247, 0.35)",
                    color: isHovered ? "#FFFFFF" : "var(--primary-light, #C084FC)",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all var(--transition-fast, 0.2s ease)",
                    boxShadow: isHovered ? "0 0 12px rgba(124, 58, 237, 0.4)" : "none",
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
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(168, 85, 247, 0.15)",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {/* Pagination buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {remainingCount > 0 && (
              <button
                onClick={handleShowMore}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--primary-light, #C084FC)",
                  background: "rgba(124, 58, 237, 0.15)",
                  border: "1px solid rgba(168, 85, 247, 0.35)",
                  borderRadius: "var(--radius-sm, 8px)",
                  padding: "5px 12px",
                  cursor: "pointer",
                  transition: "all var(--transition-fast, 0.2s ease)",
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
                  fontSize: "12px",
                  color: "var(--text-muted, #A0AEC0)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                {language === "ar" ? `عرض الكل (${total})` : `Show all (${total})`}
              </button>
            )}

            {visibleLimit > INITIAL_PREVIEW_COUNT && (
              <button
                onClick={handleShowLess}
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted, #A0AEC0)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
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
              fontWeight: 600,
              color: "var(--accent-cyan, #00F5D4)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "color 0.2s ease",
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
