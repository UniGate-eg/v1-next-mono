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
 * Renders inline filter chips for university type (PUBLIC/PRIVATE/NATIONAL/etc.).
 * Counts are derived from the pre-scored list passed in — zero re-scoring.
 * State is owned by the parent MajorCard — no global state used.
 *
 * SRP: This component only renders filter chips and emits change events.
 * It does not manage which type is active; that state lives in MajorCard.
 */
export function MajorTypeFilter({
  universities,
  activeFilter,
  language,
  onChange,
}: MajorTypeFilterProps) {
  // Compute counts per type — cheap O(n) on the already-filtered list
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

  // Don't render chips if only one type exists (no useful filtering)
  if (typeCounts.length <= 2) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginBottom: "12px",
      }}
    >
      {typeCounts.map((tc) => {
        const isActive = activeFilter === tc.type;
        return (
          <button
            key={tc.type}
            onClick={() => onChange(tc.type)}
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              border: isActive
                ? "1.5px solid var(--accent-primary, #E11D48)"
                : "1.5px solid var(--border-subtle, #e5e7eb)",
              background: isActive
                ? "var(--accent-primary, #E11D48)"
                : "var(--surface-elevated, #fff)",
              color: isActive
                ? "#fff"
                : "var(--text-secondary, #6b7280)",
              fontSize: "11px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              lineHeight: 1.6,
            }}
          >
            {language === "ar" ? tc.labelAr : tc.label}{" "}
            <span style={{ opacity: 0.8 }}>({tc.count})</span>
          </button>
        );
      })}
    </div>
  );
}
