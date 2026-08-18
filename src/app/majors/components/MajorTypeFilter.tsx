"use client";

import React from "react";
import type { UniversityType } from "@prisma/client";

export type TypeFilter = "ALL" | "PUBLIC" | "PRIVATE" | "NATIONAL" | "INTERNATIONAL" | "TECHNOLOGICAL";

interface TypeCount {
  type: TypeFilter;
  count: number;
  label: string;
  labelAr: string;
}

interface MajorTypeFilterProps {
  universities: Array<{ type?: string | null }>;
  activeFilter: TypeFilter;
  language: "en" | "ar";
  onChange: (filter: TypeFilter) => void;
}

const TYPE_META: Record<Exclude<TypeFilter, "ALL">, { label: string; labelAr: string }> = {
  PUBLIC:        { label: "Public",       labelAr: "حكومية"   },
  PRIVATE:       { label: "Private",      labelAr: "خاصة"     },
  NATIONAL:      { label: "National",     labelAr: "أهلية"    },
  INTERNATIONAL: { label: "International",labelAr: "دولية"    },
  TECHNOLOGICAL: { label: "Technological",labelAr: "تكنولوجية"},
};

/**
 * MajorTypeFilter
 *
 * Glassmorphic dark-theme filter chips for university types (Public, Private, National, etc.).
 * Designed to seamlessly blend with UniCompass's purple-neon dark aesthetic.
 */
export function MajorTypeFilter({
  universities,
  activeFilter,
  language,
  onChange,
}: MajorTypeFilterProps) {
  const typeCounts = React.useMemo<TypeCount[]>(() => {
    const counts: Partial<Record<TypeFilter, number>> = {};
    for (const u of universities) {
      const t = (u.type || "PUBLIC") as TypeFilter;
      counts[t] = (counts[t] ?? 0) + 1;
    }

    const result: TypeCount[] = [
      {
        type: "ALL",
        count: universities.length,
        label: "All",
        labelAr: "الكل",
      },
    ];

    for (const [type, meta] of Object.entries(TYPE_META) as [
      Exclude<TypeFilter, "ALL">,
      { label: string; labelAr: string },
    ][]) {
      const count = counts[type] ?? 0;
      if (count > 0) {
        result.push({ type, count, ...meta });
      }
    }

    return result;
  }, [universities]);

  if (typeCounts.length <= 2) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginBottom: "14px",
      }}
    >
      {typeCounts.map((tc) => {
        const isActive = activeFilter === tc.type;
        return (
          <button
            key={tc.type}
            onClick={() => onChange(tc.type)}
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius-full, 999px)",
              border: isActive
                ? "1px solid rgba(192, 132, 252, 0.7)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              background: isActive
                ? "linear-gradient(135deg, rgba(124, 58, 237, 0.45), rgba(236, 72, 153, 0.35))"
                : "rgba(255, 255, 255, 0.03)",
              color: isActive
                ? "#FFFFFF"
                : "var(--text-muted, #A0AEC0)",
              fontSize: "11.5px",
              fontWeight: isActive ? 600 : 500,
              cursor: "pointer",
              transition: "all var(--transition-fast, 0.2s ease)",
              lineHeight: 1.6,
              backdropFilter: "blur(8px)",
              boxShadow: isActive
                ? "0 0 14px rgba(124, 58, 237, 0.35)"
                : "none",
            }}
          >
            {language === "ar" ? tc.labelAr : tc.label}{" "}
            <span
              style={{
                opacity: isActive ? 1 : 0.65,
                fontWeight: 600,
                marginInlineStart: "2px",
              }}
            >
              ({tc.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
