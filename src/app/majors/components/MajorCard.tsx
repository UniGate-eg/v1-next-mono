"use client";

import React, { useState } from "react";
import type { ScoredUniversity } from "@/lib/majors/interfaces/IMajorMatchEngine";
import type { SlimSearchToken } from "@/types/university.types";
import type { MajorDefinition } from "@/lib/majors/MajorDefinitions";
import { MajorUniList } from "./MajorUniList";

interface MajorCardProps {
  major: MajorDefinition;
  /** Pre-scored universities for this major — sorted descending by score */
  scoredUniversities: ScoredUniversity[];
  language: "en" | "ar";
  animationDelay: number;
  onSelectUniversity: (u: SlimSearchToken) => void;
}

/**
 * MajorCard — Isolated Presentational Card
 *
 * Responsible for:
 *   - Rendering the major card header (icon, name, count)
 *   - Managing expand/collapse toggle (local state)
 *   - Delegating list rendering to MajorUniList
 *
 * NOT responsible for:
 *   - Academic matching logic (done by MajorMatchEngine upstream)
 *   - Global state (no Zustand, no Context reads)
 *   - Language detection (received as prop)
 *
 * SRP: One component, one job — render the card shell.
 */
export function MajorCard({
  major,
  scoredUniversities,
  language,
  animationDelay,
  onSelectUniversity,
}: MajorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCount = scoredUniversities.length;
  const majorName = language === "ar" ? major.name_ar : major.name;

  const countLabel =
    language === "ar"
      ? `${totalCount} جامعة`
      : `${totalCount} ${totalCount === 1 ? "university" : "universities"}`;

  return (
    <div
      className={`major-card animate-in ${isExpanded ? "expanded" : ""}`}
      data-major={major.id}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Card Header — click to expand/collapse */}
      <div
        className="major-card-header"
        onClick={() => setIsExpanded((prev) => !prev)}
        style={{ cursor: "pointer" }}
      >
        <div className="major-card-title">
          <span className="major-card-icon">{major.icon}</span>
          <span className="major-card-name">{majorName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="major-card-count">{countLabel}</span>
          <div className="major-card-toggle">{isExpanded ? "▲" : "▼"}</div>
        </div>
      </div>

      {/* Card Body — rendered but display:none via CSS when collapsed */}
      <div className="major-card-body">
        <div className="major-card-body-inner">
          {totalCount === 0 ? (
            <div
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                padding: "12px 0",
                fontStyle: "italic",
              }}
            >
              {language === "ar"
                ? "راجع دليل الجامعات للاطلاع على البرامج الأكاديمية الجديدة."
                : "Explore the university directory for emerging academic tracks."}
            </div>
          ) : (
            <MajorUniList
              scoredUniversities={scoredUniversities}
              language={language}
              majorId={major.id}
              majorName={major.name}
              onSelectUniversity={onSelectUniversity}
            />
          )}
        </div>
      </div>
    </div>
  );
}
