"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import {
  UniversityModal,
  type UniversityData,
} from "@/components/university/UniversityModal";
import type { SlimSearchToken } from "@/types/university.types";

// Engine
import { MajorMatchEngine } from "@/lib/majors/engine/MajorMatchEngine";
import { DegreeProgramMatchSource } from "@/lib/majors/engine/DegreeProgramMatchSource";
import { AcademicEntityMatchSource } from "@/lib/majors/engine/AcademicEntityMatchSource";
import type { ScoredUniversity } from "@/lib/majors/interfaces/IMajorMatchEngine";

// Definitions & Components
import { MAJOR_DEFINITIONS } from "@/lib/majors/MajorDefinitions";
import { MajorCard } from "@/app/majors/components/MajorCard";

interface MajorsClientProps {
  initialUniversities?: SlimSearchToken[];
}

/**
 * MajorsClient — Thin Coordinator Component
 *
 * Responsibilities:
 *   1. Receive SSR-preloaded universities and hydrate the search index.
 *   2. Instantiate MajorMatchEngine (once per lifecycle via useMemo).
 *   3. Pre-score all major/university pairs (once on mount via useMemo).
 *   4. Filter visible majors based on the search query.
 *   5. Render MajorCard[] — all matching logic is delegated to the engine.
 *   6. Own the UniversityModal selection state.
 *
 * NOT responsible for:
 *   - Academic matching algorithm (MajorMatchEngine)
 *   - Major keyword definitions (MajorDefinitions.ts)
 *   - Card expand/collapse state (MajorCard)
 *   - University list display (MajorUniList)
 *   - Filter chip UI (MajorTypeFilter)
 *
 * Performance:
 *   - Engine is a stateless singleton, instantiated once.
 *   - All scoring is done in a single useMemo pass (~1–2ms on mount).
 *   - Subsequent interactions (search, expand, filter, show more) are
 *     purely synchronous operations on pre-computed data — zero re-scoring.
 */
export function MajorsClient({ initialUniversities = [] }: MajorsClientProps) {
  const { language } = useLanguage();
  const { index: universitiesDatabase } = useUniversitySearch(initialUniversities);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);

  // ─── Engine Instantiation (once per component lifecycle) ───────────────────
  // Engine is stateless — safe to memoize with empty deps.
  const engine = useMemo(
    () =>
      new MajorMatchEngine([
        new DegreeProgramMatchSource(), // weight: 10 — highest authority
        new AcademicEntityMatchSource(), // weight: 7  — structural academic proof
      ]),
    [],
  );

  // ─── Pre-Score All Major/University Pairs ──────────────────────────────────
  // Computed once when universitiesDatabase is loaded. Re-runs only if the
  // database reference changes (practically never during a client session).
  const scoredByMajorId = useMemo<Map<string, ScoredUniversity[]>>(() => {
    const map = new Map<string, ScoredUniversity[]>();
    for (const major of MAJOR_DEFINITIONS) {
      map.set(major.id, engine.getMatches(universitiesDatabase as SlimSearchToken[], major));
    }
    return map;
  }, [universitiesDatabase, engine]);

  // ─── Major Search Filter ───────────────────────────────────────────────────
  // Cheap string filter on the 19-item definitions array — runs on every keystroke.
  const filteredMajors = useMemo(() => {
    if (!searchQuery.trim()) return MAJOR_DEFINITIONS;
    const q = searchQuery.toLowerCase();
    return MAJOR_DEFINITIONS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.name_ar.includes(q) ||
        m.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  return (
    <div className="majors-tab-container">
      {/* ── Page Mini Hero ─────────────────────────────────────────────────── */}
      <div className="page-hero-mini">
        <div className="gradient-orb orb-mini-1"></div>
        <div className="gradient-orb orb-mini-2"></div>
        <div className="container">
          <h1 className="page-title animate-in">
            {language === "ar" ? "استكشف التخصصات" : "Explore Majors"}
          </h1>
          <p className="page-subtitle animate-in">
            {language === "ar"
              ? "ابدأ من ما تريد دراسته — اكتشف كل جامعة تقدمه."
              : "Start from what you want to study — see every university that offers it."}
          </p>
          <div className="search-container search-sm animate-in">
            <div className="search-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              id="majorSearchInput"
              placeholder={
                language === "ar"
                  ? "ابحث عن تخصص (مثال: هندسة، طب، ذكاء اصطناعي)..."
                  : "Search majors (e.g. Computer Science, Pharmacy, Law)..."
              }
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Major Cards Grid ───────────────────────────────────────────────── */}
      <div className="container">
        <div className="majors-grid" id="majorsGrid">
          {filteredMajors.map((major, index) => (
            <MajorCard
              key={major.id}
              major={major}
              scoredUniversities={scoredByMajorId.get(major.id) ?? []}
              language={language as "en" | "ar"}
              animationDelay={(index % 6) * 50}
              onSelectUniversity={(u) => setSelectedUniModal(u as UniversityData)}
            />
          ))}

          {filteredMajors.length === 0 && searchQuery.trim() && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-muted)",
                fontSize: "14px",
              }}
            >
              {language === "ar"
                ? `لا توجد تخصصات تطابق "${searchQuery}". جرب كلمة أخرى.`
                : `No majors found for "${searchQuery}". Try a different keyword.`}
            </div>
          )}
        </div>
      </div>

      {/* ── University Detail Modal ────────────────────────────────────────── */}
      {selectedUniModal && (
        <UniversityModal
          uni={selectedUniModal}
          onClose={() => setSelectedUniModal(null)}
        />
      )}
    </div>
  );
}
