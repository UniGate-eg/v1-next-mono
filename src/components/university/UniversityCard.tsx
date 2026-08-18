"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompareStore } from "@/stores/compareStore";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { UniversityData } from "./UniversityModal";

interface UniversityCardProps {
  university: UniversityData;
  onViewDetails?: (uni: UniversityData) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function UniversityCard({
  university,
  onViewDetails,
  className = "",
  style = {},
}: UniversityCardProps) {
  const { language } = useLanguage();
  const { selectedUniversities, toggleUniversity } = useCompareStore();
  const { bookmarks, createBookmark, deleteBookmark } = useBookmarks();

  if (!university) return null;

  const uniIdStr = String(university.id);
  const isCompared = selectedUniversities.some((u) => String(u.id) === uniIdStr);

  const existingBookmark = bookmarks.find(
    (b) => String(b.universityId) === uniIdStr || String(b.university?.id) === uniIdStr
  );
  const isBookmarked = !!existingBookmark;

  const getLangField = (fieldName: string) => {
    const uniAny = university as any;
    if (language === "ar") {
      if (uniAny[fieldName + "_ar"]) return uniAny[fieldName + "_ar"];
      if (uniAny[fieldName + "Ar"]) return uniAny[fieldName + "Ar"];
      if (fieldName === "description" || fieldName === "overview") {
        return uniAny.overviewAr || uniAny.overview_ar || uniAny.description_ar || uniAny.description || uniAny.overviewEn;
      }
      if (fieldName === "location") return uniAny.city_ar || uniAny.city || uniAny.governorate || "مصر";
      if (fieldName === "name") return uniAny.nameAr || uniAny.name_ar || uniAny.nameEn || uniAny.name;
    }
    if (uniAny[fieldName + "En"]) return uniAny[fieldName + "En"];
    if (fieldName === "description" || fieldName === "overview") {
      return uniAny.overviewEn || uniAny.overview_en || uniAny.description || uniAny.overviewAr;
    }
    if (fieldName === "location") return uniAny.city || uniAny.governorate || "Egypt";
    if (fieldName === "name") return uniAny.nameEn || uniAny.name || uniAny.nameAr;
    return uniAny[fieldName] || "";
  };

  const getLangArray = (fieldName: string): string[] => {
    const uniAny = university as any;
    if (language === "ar") {
      if (Array.isArray(uniAny[fieldName + "_ar"]) && uniAny[fieldName + "_ar"].length > 0) return uniAny[fieldName + "_ar"];
      if (Array.isArray(uniAny[fieldName + "Ar"]) && uniAny[fieldName + "Ar"].length > 0) return uniAny[fieldName + "Ar"];
      if (fieldName === "strengths" && Array.isArray(uniAny.strengthsAr) && uniAny.strengthsAr.length > 0) return uniAny.strengthsAr;
      if (fieldName === "faculties" && Array.isArray(uniAny.faculties_ar) && uniAny.faculties_ar.length > 0) return uniAny.faculties_ar;
    }
    if (Array.isArray(uniAny[fieldName + "En"]) && uniAny[fieldName + "En"].length > 0) return uniAny[fieldName + "En"];
    if (fieldName === "strengths" && Array.isArray(uniAny.strengthsEn) && uniAny.strengthsEn.length > 0) return uniAny.strengthsEn;
    if (fieldName === "faculties" && Array.isArray(uniAny.faculties) && uniAny.faculties.length > 0) {
      return uniAny.faculties.map((item: any) => typeof item === "string" ? item : item.nameEn || item.name || "").filter(Boolean);
    }
    if (Array.isArray(uniAny[fieldName])) {
      return uniAny[fieldName]
        .map((item: any) =>
          typeof item === "string"
            ? item
            : (language === "ar" && item.nameAr ? item.nameAr : item.nameEn) || item.name || ""
        )
        .filter(Boolean);
    }
    return [];
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked && existingBookmark) {
      deleteBookmark(existingBookmark.id);
    } else {
      createBookmark({
        universityId: uniIdStr,
        status: "INTERESTED",
      });
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleUniversity({
      id: uniIdStr,
      slug: (university as any).slug || String(university.id),
      nameAr: (university as any).name_ar || (university as any).nameAr || university.name || "",
      nameEn: (university as any).name || (university as any).nameEn || "",
      type: (university as any).type || "PUBLIC",
      governorate: (university as any).city || (university as any).governorate || "Cairo",
      majorsCount: university.majors?.length || university.faculties?.length || 0,
    });
  };

  const rawFacs =
    university.structured_faculties && university.structured_faculties.length > 0
      ? university.structured_faculties
      : getLangArray("faculties");

  const facultiesList = (rawFacs || [])
    .map((f: any) => {
      if (!f) return "";
      if (typeof f === "string") return f.trim();
      if (typeof f === "object") {
        return (language === "ar" && f.name_ar ? f.name_ar : f.name_en) || f.name || "";
      }
      return String(f);
    })
    .filter(Boolean);

  const strengthsList = getLangArray("strengths");

  const uniName = getLangField("name") || university.nameEn || university.name || "";
  const modelName = getLangField("model") || university.type || "University";
  const locationName = getLangField("location") || (university as any).governorate || "Egypt";
  const typeName = getLangField("type") || university.type || "University";

  return (
    <div
      className={`uni-card animate-in ${className}`}
      style={
        {
          "--card-accent": university.accentGradient || "linear-gradient(135deg, #7C3AED, #EC4899)",
          ...style,
        } as React.CSSProperties
      }
      onClick={() => onViewDetails && onViewDetails(university)}
    >
      <div className="uni-card-header">
        <div className="uni-card-model">
          <span>{university.modelEmoji || "🎓"}</span>
          <span>{modelName}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {university.qs_ranking && university.qs_ranking !== "N/A" && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                background: "rgba(251, 191, 36, 0.15)",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                color: "#F59E0B",
                padding: "3px 8px",
                borderRadius: "12px",
              }}
            >
              🏆 {String(university.qs_ranking).includes("#1") ? "#1 Egypt" : "Top 500"}
            </span>
          )}
          <div className="uni-card-emoji">{university.emoji || "🏛️"}</div>
        </div>
      </div>

      <h3 className="uni-card-name">{uniName}</h3>
      <div className="uni-card-location">
        {locationName} · {typeName}
      </div>
      <p className="uni-card-desc">{getLangField("description") || university.description}</p>

      {strengthsList.length > 0 && (
        <>
          <div className="uni-card-strengths-label">
            {language === "ar" ? "أبرز نقاط القوة" : "Key Strengths"}
          </div>
          <div className="uni-card-strengths">
            {strengthsList.slice(0, 4).map((s, idx) => (
              <span key={idx} className="strength-tag">
                {s}
              </span>
            ))}
          </div>
        </>
      )}

      {facultiesList.length > 0 && (
        <div className="uni-card-faculties">
          <strong>{language === "ar" ? "الكليات الأكاديمية:" : "Main Faculties:"}</strong>{" "}
          {facultiesList
            .slice(0, 3)
            .map((f: string) => f.split(" ").slice(0, 3).join(" "))
            .join(" · ")}
          {facultiesList.length > 3 && ` (+${facultiesList.length - 3})`}
        </div>
      )}

      <div className="uni-card-footer">
        <button
          className="view-details-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(university);
          }}
        >
          {language === "ar" ? "عرض التفاصيل" : "View Details"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="uni-card-type">{typeName}</span>
          <button
            className={`card-compare-btn ${isCompared ? "selected" : ""}`}
            onClick={handleCompareClick}
            title={language === "ar" ? "مقارنة الجامعة" : "Compare university"}
            aria-label="Compare university"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3h5v5M4 21V13M4 9V3M20 21v-9M12 21V10M12 6V3M8 14h8" />
            </svg>
          </button>
          <button
            className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`}
            onClick={handleBookmarkClick}
            aria-label="Bookmark university"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
