"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SuggestionDialog } from "@/components/university/SuggestionDialog";
import { useCompareStore } from "@/stores/compareStore";
import { useBookmarks } from "@/hooks/useBookmarks";
import {
  X,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Trophy,
  Phone,
  Mail,
  Globe,
  GraduationCap,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
  Scale,
  Copy,
  Check,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Clock,
  Compass,
  Users,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";

export interface UniversityData {
  id: string | number;
  slug?: string;
  name?: string;
  nameEn?: string;
  name_ar?: string;
  nameAr?: string;
  shortName?: string | null;
  emoji?: string | null;
  model?: string;
  model_ar?: string;
  modelEmoji?: string | null;
  location?: string;
  location_ar?: string;
  city?: string | null;
  city_ar?: string | null;
  governorate?: string | null;
  type?: string;
  type_ar?: string;
  founded?: number;
  established?: number | null;
  tuition?: string | null;
  tuition_ar?: string | null;
  students?: string;
  description?: string | null;
  description_ar?: string | null;
  overview?: string | null;
  overview_ar?: string | null;
  overviewEn?: string | null;
  overviewAr?: string | null;
  strengths?: string[];
  strengths_ar?: string[];
  strengthsEn?: string[];
  strengthsAr?: string[];
  faculties?: any[];
  faculties_ar?: any[];
  majors?: any[];
  degreePrograms?: any[];
  accentGradient?: string | null;
  featured?: boolean;
  qs_ranking?: string | null;
  qsRanking?: string | null;
  the_ranking?: string | null;
  theRanking?: string | null;
  address?: string | null;
  address_ar?: string | null;
  addressEn?: string | null;
  addressAr?: string | null;
  phones?: string[];
  emails?: string[];
  social_links?: Record<string, string> | null;
  socialLinks?: Record<string, string> | null;
  international_accreditations?: string[];
  accreditations?: any[];
  structured_faculties?: any[];
  website?: string | null;
}

const universityDetailsMemoryCache = new Map<string, any>();

interface UniversityModalProps {
  uni: UniversityData | null;
  onClose: () => void;
  onSelectMajor?: (majorName: string) => void;
}

export function UniversityModal({ uni, onClose, onSelectMajor }: UniversityModalProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const { selectedUniversities, toggleUniversity } = useCompareStore();
  const { bookmarks, createBookmark, deleteBookmark } = useBookmarks();

  const [expandedFaculties, setExpandedFaculties] = useState<Record<number, boolean>>({ 0: true });
  const [activeTab, setActiveTab] = useState<"faculties" | "admission" | "facilities" | "contact">("faculties");
  const [allExpanded, setAllExpanded] = useState(false);
  const [fullUni, setFullUni] = useState<any>(() => {
    if (uni && (uni as any).slug && universityDetailsMemoryCache.has((uni as any).slug)) {
      return universityDetailsMemoryCache.get((uni as any).slug);
    }
    return uni;
  });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const uniIdStr = String(uni?.id || "");
  const isCompared = selectedUniversities.some((u) => String(u.id) === uniIdStr);
  const existingBookmark = bookmarks.find(
    (b) => String(b.universityId) === uniIdStr || String(b.university?.id) === uniIdStr
  );
  const isBookmarked = !!existingBookmark;

  useEffect(() => {
    if (!uni) return;
    const slug = (uni as any).slug;
    if (slug) {
      if (universityDetailsMemoryCache.has(slug)) {
        setFullUni(universityDetailsMemoryCache.get(slug));
      } else {
        setFullUni(uni);
        fetch(`/api/universities/${slug}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.data) {
              universityDetailsMemoryCache.set(slug, data.data);
              setFullUni(data.data);
            }
          })
          .catch((err) => console.warn("Failed to fetch full university details:", err));
      }
    } else {
      setFullUni(uni);
    }
  }, [uni]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (uni) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [uni, onClose]);

  if (!uni) return null;

  const displayUni = fullUni || uni;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleBookmarkToggle = () => {
    if (isBookmarked && existingBookmark) {
      deleteBookmark(existingBookmark.id);
    } else {
      createBookmark({
        universityId: uniIdStr,
        status: "INTERESTED",
      });
    }
  };

  const handleCompareToggle = () => {
    toggleUniversity({
      id: uniIdStr,
      slug: (displayUni as any).slug || String(displayUni.id),
      nameAr: (displayUni as any).name_ar || (displayUni as any).nameAr || displayUni.name || "",
      nameEn: (displayUni as any).name || (displayUni as any).nameEn || "",
      type: (displayUni as any).type || "PUBLIC",
      governorate: (displayUni as any).city || (displayUni as any).governorate || "Cairo",
      majorsCount: displayUni.majors?.length || displayUni.faculties?.length || 0,
    });
  };

  const getLangField = (fieldName: string) => {
    const uniAny = displayUni as any;
    if (isArabic) {
      if (uniAny[fieldName + "_ar"]) return uniAny[fieldName + "_ar"];
      if (uniAny[fieldName + "Ar"]) return uniAny[fieldName + "Ar"];
      if (fieldName === "overview" || fieldName === "description") {
        return uniAny.overviewAr || uniAny.overview_ar || uniAny.description_ar || uniAny.description || uniAny.overviewEn;
      }
      if (fieldName === "location" || fieldName === "city") {
        return uniAny.city_ar || uniAny.city || uniAny.governorate || "مصر";
      }
      if (fieldName === "name") return uniAny.nameAr || uniAny.name_ar || uniAny.nameEn || uniAny.name;
    }
    if (uniAny[fieldName + "En"]) return uniAny[fieldName + "En"];
    if (fieldName === "overview" || fieldName === "description") {
      return uniAny.overviewEn || uniAny.overview_en || uniAny.description || uniAny.overviewAr;
    }
    if (fieldName === "location" || fieldName === "city") {
      return uniAny.city || uniAny.governorate || "Egypt";
    }
    if (fieldName === "name") return uniAny.nameEn || uniAny.name || uniAny.nameAr;
    return uniAny[fieldName] || "";
  };

  const getLangArray = (fieldName: string): string[] => {
    const uniAny = displayUni as any;
    if (isArabic) {
      if (Array.isArray(uniAny[fieldName + "_ar"]) && uniAny[fieldName + "_ar"].length > 0) return uniAny[fieldName + "_ar"];
      if (Array.isArray(uniAny[fieldName + "Ar"]) && uniAny[fieldName + "Ar"].length > 0) return uniAny[fieldName + "Ar"];
      if (fieldName === "strengths" && Array.isArray(uniAny.strengthsAr) && uniAny.strengthsAr.length > 0) return uniAny.strengthsAr;
    }
    if (Array.isArray(uniAny[fieldName + "En"]) && uniAny[fieldName + "En"].length > 0) return uniAny[fieldName + "En"];
    if (fieldName === "strengths" && Array.isArray(uniAny.strengthsEn) && uniAny.strengthsEn.length > 0) return uniAny.strengthsEn;
    if (Array.isArray(uniAny[fieldName])) {
      return uniAny[fieldName]
        .map((item: any) =>
          typeof item === "string"
            ? item
            : (isArabic && item.nameAr ? item.nameAr : item.nameEn) || item.name || ""
        )
        .filter(Boolean);
    }
    return [];
  };

  const toggleFaculty = (idx: number) => {
    setExpandedFaculties((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const structuredFaculties = displayUni.faculties || displayUni.structured_faculties || [];
  const degreePrograms = displayUni.degreePrograms || displayUni.majors || [];

  const facultyItems = useMemo(() => {
    if (structuredFaculties.length > 0) {
      return structuredFaculties.map((fac: any) => {
        const facName = isArabic && fac.nameAr ? fac.nameAr : fac.nameEn || fac.name || "";
        const facDesc = isArabic && fac.descriptionAr ? fac.descriptionAr : fac.descriptionEn || fac.description || null;
        
        const facPrograms = degreePrograms.filter(
          (p: any) => p.facultyId === fac.id || (p.faculty && p.faculty.id === fac.id)
        );

        const depts = fac.departments && fac.departments.length > 0
          ? fac.departments
          : facPrograms.map((p: any) => isArabic && p.nameAr ? p.nameAr : p.nameEn || p.name || "");

        return {
          name: facName,
          dean: fac.deanName || fac.dean_name || null,
          description: facDesc,
          departments: depts,
          programs: facPrograms,
        };
      });
    }

    const flatFacs = getLangArray("faculties");
    if (flatFacs.length > 0) {
      return flatFacs.map((f: string) => ({
        name: f,
        dean: null,
        description: null,
        departments: [],
        programs: [],
      }));
    }

    return [
      {
        name: isArabic ? "البرامج والتخصصات الأكاديمية" : "Academic Programs & Majors",
        dean: null,
        description: null,
        departments: degreePrograms.map((p: any) => isArabic && p.nameAr ? p.nameAr : p.nameEn || p.name || ""),
        programs: degreePrograms,
      },
    ];
  }, [structuredFaculties, degreePrograms, isArabic]);

  const handleFacultiesTabClick = () => {
    if (activeTab !== "faculties") {
      setActiveTab("faculties");
    } else {
      const nextState = !allExpanded;
      setAllExpanded(nextState);
      const newExpanded: Record<number, boolean> = {};
      facultyItems.forEach((_: any, idx: number) => {
        newExpanded[idx] = nextState;
      });
      setExpandedFaculties(newExpanded);
    }
  };

  const uniName = getLangField("name");
  const subTitleName = isArabic ? displayUni.nameEn : displayUni.nameAr;
  const rank = displayUni.qsRanking || displayUni.qs_ranking || displayUni.theRanking || displayUni.the_ranking;
  const establishedYear = displayUni.established || displayUni.founded;
  const strengths = getLangArray("strengths");
  const accreditations = displayUni.accreditations || displayUni.international_accreditations || [];

  return (
    <div
      className="modal-overlay show"
      id="modalOverlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "modalOverlay") onClose();
      }}
    >
      <div
        className="modal"
        id="uniModal"
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "88vh",
          background: "var(--bg-surface, #131534)",
          border: "1px solid var(--border, rgba(168, 85, 247, 0.25))",
          borderRadius: "24px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(124, 58, 237, 0.2)",
        }}
      >
        {/* Top Control Buttons */}
        <div style={{ position: "absolute", top: "16px", right: isArabic ? "auto" : "16px", left: isArabic ? "16px" : "auto", display: "flex", alignItems: "center", gap: "8px", zIndex: 10 }}>
          {/* Quick Compare */}
          <button
            onClick={handleCompareToggle}
            className={`card-compare-btn ${isCompared ? "selected" : ""}`}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: isCompared ? "var(--primary)" : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              cursor: "pointer",
            }}
            title={isArabic ? "مقارنة الجامعة" : "Compare university"}
          >
            <Scale style={{ width: "15px", height: "15px" }} />
          </button>

          {/* Quick Bookmark */}
          <button
            onClick={handleBookmarkToggle}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: isBookmarked ? "#E11D48" : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              cursor: "pointer",
            }}
            title={isArabic ? "إضافة للمفضلة" : "Bookmark university"}
          >
            <Heart style={{ width: "15px", height: "15px", fill: isBookmarked ? "#FFF" : "none" }} />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFF",
              cursor: "pointer",
            }}
            aria-label="Close modal"
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div style={{ overflowY: "auto", padding: "28px 32px 24px 32px", flex: 1 }}>
          {/* Modal Header */}
          <div style={{ borderBottom: "1px solid var(--border, rgba(168, 85, 247, 0.2))", paddingBottom: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
              <div style={{ fontSize: "42px", lineHeight: 1 }}>{displayUni.emoji || "🏛️"}</div>
              <div style={{ flex: 1, paddingRight: isArabic ? "0" : "100px", paddingLeft: isArabic ? "100px" : "0" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "800", margin: 0, color: "#FFF", fontFamily: "var(--font-display)" }}>
                  {uniName}
                </h2>
                {subTitleName && (
                  <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {subTitleName}
                  </div>
                )}
              </div>
            </div>

            {/* Meta Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              <span className="modal-meta-item">
                {displayUni.modelEmoji || "🎓"} {displayUni.educationModel || getLangField("model") || "University"} {isArabic ? "نموذج" : "Model"}
              </span>
              <span className="modal-meta-item">
                📍 {getLangField("location")}
              </span>
              <span className="modal-meta-item">
                🏛️ {displayUni.type || "University"}
              </span>
              {establishedYear && (
                <span className="modal-meta-item">
                  📅 {isArabic ? `تأسست ${establishedYear}` : `Est. ${establishedYear}`}
                </span>
              )}
              {rank && rank !== "N/A" && (
                <span
                  className="modal-meta-item"
                  style={{
                    background: "rgba(251, 191, 36, 0.15)",
                    borderColor: "rgba(251, 191, 36, 0.4)",
                    color: "#F59E0B",
                    fontWeight: "700",
                  }}
                >
                  🏆 {rank}
                </span>
              )}
            </div>

            {/* Overview Paragraph */}
            <p style={{ fontSize: "14px", color: "var(--text-secondary, #E2E8F0)", lineHeight: "1.65", marginTop: "14px" }}>
              {getLangField("overview") || getLangField("description")}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="modal-info-grid" style={{ marginBottom: "20px" }}>
            <div className="modal-info-item">
              <div className="modal-info-value">{establishedYear || "N/A"}</div>
              <div className="modal-info-label">{isArabic ? "سنة التأسيس" : "Founded"}</div>
            </div>
            <div className="modal-info-item">
              <div className="modal-info-value" style={{ color: "#F59E0B" }}>
                {rank ? (String(rank).includes("#1") ? "#1 in Egypt" : String(rank).split("/")[0]) : "Ranked"}
              </div>
              <div className="modal-info-label">{isArabic ? "التصنيف الدولي" : "QS Ranking"}</div>
            </div>
            <div className="modal-info-item">
              <div className="modal-info-value" style={{ color: "var(--primary-light)" }}>
                {displayUni.type || "University"}
              </div>
              <div className="modal-info-label">{isArabic ? "نوع المؤسسة" : "Type"}</div>
            </div>
            <div className="modal-info-item">
              <div className="modal-info-value" style={{ color: "var(--accent-cyan)" }}>
                {getLangField("city")}
              </div>
              <div className="modal-info-label">{isArabic ? "المدينة" : "City"}</div>
            </div>
          </div>

          {/* Tuition Fee Overview Banner */}
          <div
            style={{
              background: "rgba(124, 58, 237, 0.08)",
              borderRadius: "14px",
              padding: "14px 20px",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "14px", color: "#FFF" }}>
              💰 {isArabic ? "المصروفات السنوية التقديرية" : "Estimated Annual Tuition"}
            </span>
            <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--accent-emerald, #10B981)" }}>
              {displayUni.tuition || (isArabic ? "حسب الكلية ونظام الساعات" : "Varies by Faculty")}
            </span>
          </div>

          {/* Key Strengths Tags */}
          {strengths.length > 0 && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "10px" }}>
                ⭐ {isArabic ? "أبرز نقاط القوة والمزايا" : "Key Strengths"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {strengths.slice(0, 6).map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "20px",
                      background: "rgba(124, 58, 237, 0.12)",
                      border: "1px solid rgba(124, 58, 237, 0.25)",
                      fontSize: "12px",
                      color: "var(--primary-light, #C084FC)",
                      fontWeight: "500",
                    }}
                  >
                    ✨ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              borderBottom: "1px solid var(--border, rgba(168, 85, 247, 0.2))",
              paddingBottom: "12px",
              marginBottom: "20px",
              overflowX: "auto",
            }}
          >
            <button
              onClick={handleFacultiesTabClick}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: activeTab === "faculties" ? "1px solid var(--primary-light)" : "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                background: activeTab === "faculties" ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "rgba(255,255,255,0.05)",
                color: activeTab === "faculties" ? "#FFF" : "var(--text-muted)",
                boxShadow: activeTab === "faculties" ? "0 4px 15px rgba(124, 58, 237, 0.35)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              📚 {isArabic ? "الكليات والأقسام" : "Faculties & Programs"} ({facultyItems.length})
              {activeTab === "faculties" && (
                <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.2)", padding: "2px 6px", borderRadius: "8px" }}>
                  {allExpanded ? (isArabic ? "طي" : "Collapse") : (isArabic ? "توسيع" : "Expand All")}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("admission")}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: activeTab === "admission" ? "1px solid var(--primary-light)" : "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                background: activeTab === "admission" ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "rgba(255,255,255,0.05)",
                color: activeTab === "admission" ? "#FFF" : "var(--text-muted)",
                boxShadow: activeTab === "admission" ? "0 4px 15px rgba(124, 58, 237, 0.35)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              📜 {isArabic ? "شروط القبول" : "Admissions"}
            </button>

            <button
              onClick={() => setActiveTab("facilities")}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: activeTab === "facilities" ? "1px solid var(--primary-light)" : "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                background: activeTab === "facilities" ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "rgba(255,255,255,0.05)",
                color: activeTab === "facilities" ? "#FFF" : "var(--text-muted)",
                boxShadow: activeTab === "facilities" ? "0 4px 15px rgba(124, 58, 237, 0.35)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              🔬 {isArabic ? "الاعتمادات والمرافق" : "Accreditation"}
            </button>

            <button
              onClick={() => setActiveTab("contact")}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: activeTab === "contact" ? "1px solid var(--primary-light)" : "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                background: activeTab === "contact" ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "rgba(255,255,255,0.05)",
                color: activeTab === "contact" ? "#FFF" : "var(--text-muted)",
                boxShadow: activeTab === "contact" ? "0 4px 15px rgba(124, 58, 237, 0.35)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              📞 {isArabic ? "التواصل والموقع" : "Contact & Campus"}
            </button>
          </div>

          {/* TAB 1: FACULTIES ACCORDION */}
          {activeTab === "faculties" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {facultyItems.map((fac: any, idx: number) => {
                const isExpanded = !!expandedFaculties[idx];
                const depts = fac.departments || [];
                const programs = fac.programs || [];

                return (
                  <div
                    key={idx}
                    style={{
                      background: isExpanded ? "rgba(124, 58, 237, 0.08)" : "rgba(255, 255, 255, 0.03)",
                      border: isExpanded ? "1px solid var(--primary-light)" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      onClick={() => toggleFaculty(idx)}
                      style={{
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none",
                        background: isExpanded ? "rgba(124, 58, 237, 0.12)" : "transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        <span style={{ fontSize: "18px" }}>🏛️</span>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "15px", color: "#FFF" }}>{fac.name}</div>
                          {fac.dean && (
                            <div style={{ fontSize: "12px", color: "#FCD34D", marginTop: "2px", fontWeight: "500" }}>
                              👨‍🏫 {isArabic ? "العميد:" : "Dean:"} {fac.dean}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {depts.length > 0 && (
                          <span style={{ fontSize: "11px", fontWeight: "600", background: "rgba(0, 245, 212, 0.12)", border: "1px solid rgba(0, 245, 212, 0.3)", padding: "3px 10px", borderRadius: "14px", color: "var(--accent-cyan)" }}>
                            {depts.length} {isArabic ? "برنامج/قسم" : "Programs"}
                          </span>
                        )}
                        <div
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            background: isExpanded ? "var(--primary)" : "rgba(255,255,255,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFF",
                            fontSize: "12px",
                          }}
                        >
                          {isExpanded ? "▲" : "▼"}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "12px 18px 16px 18px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        {fac.description && (
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "12px" }}>
                            {fac.description}
                          </p>
                        )}

                        {programs.length > 0 ? (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px", marginTop: "8px" }}>
                            {programs.map((prog: any, pIdx: number) => {
                              const progName = isArabic && prog.nameAr ? prog.nameAr : prog.nameEn || prog.name || "";
                              return (
                                <div
                                  key={pIdx}
                                  onClick={() => {
                                    if (onSelectMajor) onSelectMajor(progName);
                                    onClose();
                                  }}
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    background: "rgba(255, 255, 255, 0.04)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                    cursor: "pointer",
                                  }}
                                >
                                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#FFF" }}>{progName}</div>
                                  <div style={{ fontSize: "11px", color: "var(--primary-light)", marginTop: "3px" }}>
                                    {prog.degreeType || "B.Sc."} {prog.durationYears ? `· ${prog.durationYears} ${isArabic ? "سنوات" : "Yrs"}` : ""}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : depts.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                            {depts.map((dept: any, dIdx: number) => {
                              const deptName = typeof dept === "string" ? dept : dept.name || "";
                              return (
                                <span
                                  key={dIdx}
                                  onClick={() => {
                                    if (onSelectMajor) onSelectMajor(deptName);
                                    onClose();
                                  }}
                                  className="dept-tag"
                                  style={{
                                    cursor: "pointer",
                                    padding: "6px 12px",
                                    borderRadius: "16px",
                                    background: "rgba(124, 58, 237, 0.15)",
                                    border: "1px solid rgba(124, 58, 237, 0.35)",
                                    fontSize: "12px",
                                    color: "#FFF",
                                  }}
                                >
                                  🎓 {deptName}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                            {isArabic ? "يرجى مراجعة إدارة القبول لمعرفة الأقسام بالتفصيل." : "Inquire with university admissions for department details."}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ADMISSION & TUITION */}
          {activeTab === "admission" && (
            <div className="admission-grid">
              <div className="admission-card">
                <div className="admission-card-icon">💵</div>
                <h4>{isArabic ? "المصروفات السنوية التقديرية" : "Estimated Tuition Fees"}</h4>
                <p className="tuition-highlight" style={{ color: "var(--accent-emerald, #10B981)", fontWeight: "800" }}>
                  {displayUni.tuition || (isArabic ? "يرجى مراجعة الموقع الرسمي للجامعة" : "Refer to official website")}
                </p>
              </div>

              <div className="admission-card">
                <div className="admission-card-icon">👥</div>
                <h4>{isArabic ? "أعداد الطلاب" : "Student Body"}</h4>
                <p>{displayUni.students || (isArabic ? "~10,000+ طالب" : "~10,000+ Students")}</p>
              </div>

              <div className="admission-card">
                <div className="admission-card-icon">📜</div>
                <h4>{isArabic ? "شروط القبول" : "Admission Criteria"}</h4>
                <p>
                  {isArabic
                    ? "شهادة الثانوية العامة أو ما يعادلها (IGCSE, American Diploma, IB) + اختبارات القبول والمقابلة الشخصية."
                    : "General Secondary Certificate (Thanaweya Amma) or international equivalents (IG, SAT/ACT, IB) + Entrance Exams."}
                </p>
              </div>

              <div className="admission-card">
                <div className="admission-card-icon">🎁</div>
                <h4>{isArabic ? "المنح الدراسية" : "Scholarships"}</h4>
                <p>
                  {isArabic
                    ? "منح للمتفوقين أكاديمياً ورياضياً تغطي حتى 100% من المصروفات الدراسية."
                    : "Academic merit scholarships and athletic grants covering up to 100% of annual tuition."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ACCREDITATION & FACILITIES */}
          {activeTab === "facilities" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {accreditations.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "8px" }}>
                    {isArabic ? "الاعتمادات الدولية والمحلية" : "Accreditations & Recognitions"}
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {accreditations.map((acc: any, i: number) => {
                      const accName = typeof acc === "string" ? acc : acc.name || acc.fullName || "";
                      return (
                        <span
                          key={i}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "16px",
                            background: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                            color: "#10B981",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          ✅ {accName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {strengths.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary-light)", textTransform: "uppercase", marginBottom: "8px" }}>
                    {isArabic ? "المرافق ومزايا الحرم الجامعي" : "Campus Facilities & Amenities"}
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {strengths.map((str: string, i: number) => (
                      <span key={i} className="strength-tag">
                        ✨ {str}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTACT & LOCATION */}
          {activeTab === "contact" && (
            <div className="contact-grid">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <strong>{isArabic ? "العنوان:" : "Campus Address:"}</strong>
                  <p>{getLangField("address") || getLangField("location")}</p>
                </div>
              </div>

              {displayUni.website && (
                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <div>
                    <strong>{isArabic ? "الموقع الرسمي:" : "Official Website:"}</strong>
                    <p>
                      <a
                        href={displayUni.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--primary-light)", textDecoration: "underline" }}
                      >
                        {displayUni.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {displayUni.phones && displayUni.phones.length > 0 && (
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div style={{ flex: 1 }}>
                    <strong>{isArabic ? "أرقام الهاتف:" : "Telephone Lines:"}</strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                      {displayUni.phones.map((phone: string, pIdx: number) => (
                        <div key={pIdx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                          <span>{phone}</span>
                          <button
                            onClick={() => handleCopy(phone, `phone-${pIdx}`)}
                            style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px" }}
                          >
                            {copiedText === `phone-${pIdx}` ? <Check style={{ width: "12px", height: "12px", color: "#10B981" }} /> : <Copy style={{ width: "12px", height: "12px" }} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {displayUni.emails && displayUni.emails.length > 0 && (
                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <div style={{ flex: 1 }}>
                    <strong>{isArabic ? "البريد الإلكتروني:" : "Email Inquiries:"}</strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                      {displayUni.emails.map((email: string, eIdx: number) => (
                        <div key={eIdx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                          <span style={{ wordBreak: "break-all" }}>{email}</span>
                          <button
                            onClick={() => handleCopy(email, `email-${eIdx}`)}
                            style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", marginLeft: "6px" }}
                          >
                            {copiedText === `email-${eIdx}` ? <Check style={{ width: "12px", height: "12px", color: "#10B981" }} /> : <Copy style={{ width: "12px", height: "12px" }} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Toolbar */}
        <div
          style={{
            padding: "14px 24px",
            background: "rgba(10, 11, 30, 0.95)",
            borderTop: "1px solid var(--border, rgba(168, 85, 247, 0.2))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <SuggestionDialog universityId={String(displayUni.id)} universityName={uniName} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {displayUni.website && (
              <a
                href={displayUni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="view-details-btn"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                  color: "#FFF",
                  padding: "8px 18px",
                  fontSize: "13px",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "700",
                }}
              >
                <span>{isArabic ? "زيارة الموقع الرسمي" : "Visit Official Website"}</span>
                <ExternalLink style={{ width: "14px", height: "14px" }} />
              </a>
            )}
            <button
              onClick={onClose}
              className="view-details-btn"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "#FFF",
                padding: "8px 18px",
                fontSize: "13px",
                borderRadius: "12px",
              }}
            >
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
