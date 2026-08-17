"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";
import type { SlimSearchToken } from "@/types/university.types";

interface MajorDefinition {
  id: string;
  name: string;
  name_ar: string;
  icon: string;
  color: string;
  keywords: string[];
}

const majors: MajorDefinition[] = [
  {
    id: "cs",
    name: "Computer Science & Software",
    name_ar: "علوم وهندسة الحاسب والبرمجيات",
    icon: "💻",
    color: "#E11D48",
    keywords: [
      "computer",
      "computing",
      "software",
      "informatics",
      "information technology",
      "iet",
      "met",
      "حاسب",
      "معلومات",
      "برمجيات",
      "تكنولوجيا المعلومات",
    ],
  },
  {
    id: "ai",
    name: "Artificial Intelligence & Data",
    name_ar: "الذكاء الاصطناعي وعلوم البيانات",
    icon: "🤖",
    color: "#99582a",
    keywords: [
      "artificial intelligence",
      "ai",
      "data science",
      "machine learning",
      "robotics",
      "ذكاء اصطناعي",
      "بيانات",
      "روبوت",
      "تعلم الآلة",
    ],
  },
  {
    id: "industrial-eng",
    name: "Industrial & Manufacturing Engineering",
    name_ar: "الهندسة الصناعية وهندسة التصنيع",
    icon: "🏭",
    color: "#bb9457",
    keywords: [
      "industrial",
      "manufacturing",
      "production",
      "materials",
      "systems",
      "صناعي",
      "إنتاج",
      "تصنيع",
      "مواد",
      "نظم",
    ],
  },
  {
    id: "business",
    name: "Business Administration & Finance",
    name_ar: "إدارة الأعمال والمالية والمحاسبة",
    icon: "📊",
    color: "#ffe6a7",
    keywords: [
      "business",
      "management",
      "commerce",
      "finance",
      "marketing",
      "accounting",
      "economics",
      "إدارة",
      "أعمال",
      "تجارة",
      "مالية",
      "تسويق",
      "محاسبة",
      "اقتصاد",
    ],
  },
  {
    id: "pharmacy",
    name: "Pharmacy & Clinical Pharmacy",
    name_ar: "الصيدلة والصيدلة الإكلينيكية",
    icon: "💊",
    color: "#E11D48",
    keywords: [
      "pharmacy",
      "pharmaceutical",
      "pharma",
      "pharmd",
      "صيدل",
      "دواء",
      "صيدلة إكلينيكية",
      "عقاقير",
    ],
  },
  {
    id: "architectural-eng",
    name: "Architectural Engineering & Urban Design",
    name_ar: "الهندسة المعمارية والتصميم العمراني",
    icon: "🏗️",
    color: "#99582a",
    keywords: [
      "architect",
      "architecture",
      "urban design",
      "urban",
      "building",
      "عمارة",
      "معمار",
      "تخطيط عمراني",
      "تصميم عمراني",
    ],
  },
  {
    id: "mechatronics",
    name: "Mechatronics & Robotics Engineering",
    name_ar: "هندسة الميكاترونكس والروبوتات",
    icon: "⚙️",
    color: "#bb9457",
    keywords: [
      "mechatronic",
      "robotics",
      "automation",
      "control",
      "embedded",
      "ميكاترون",
      "روبوت",
      "تحكم آلي",
      "أنظمة مدمجة",
    ],
  },
  {
    id: "economics",
    name: "Economics & Political Economy",
    name_ar: "الاقتصاد والعلوم الاقتصادية",
    icon: "📈",
    color: "#ffe6a7",
    keywords: [
      "economic",
      "finance",
      "econometrics",
      "banking",
      "اقتصاد",
      "علوم اقتصادية",
      "بنوك",
    ],
  },
  {
    id: "medicine",
    name: "Medicine & Surgery (MBBCh)",
    name_ar: "الطب البشري والجراحة",
    icon: "🩺",
    color: "#E11D48",
    keywords: [
      "medicine",
      "medical",
      "surgery",
      "mbbch",
      "clinical",
      "طب",
      "بشري",
      "جراحة",
      "إكلينيكي",
    ],
  },
  {
    id: "dentistry",
    name: "Dentistry & Oral Surgery",
    name_ar: "طب وجراحة الفم والأسنان",
    icon: "🦷",
    color: "#99582a",
    keywords: [
      "dental",
      "dentistry",
      "oral",
      "orthodontics",
      "أسنان",
      "فم",
      "جراحة الأسنان",
    ],
  },
  {
    id: "law",
    name: "Law & Legal Studies",
    name_ar: "الحقوق والدراسات القانونية",
    icon: "⚖️",
    color: "#bb9457",
    keywords: [
      "law",
      "legal",
      "justice",
      "jurisprudence",
      "حقوق",
      "قانون",
      "شريعة",
      "دراسات قانونية",
    ],
  },
  {
    id: "political-science",
    name: "Political Science & International Relations",
    name_ar: "العلوم السياسية والعلاقات الدولية",
    icon: "🏛️",
    color: "#ffe6a7",
    keywords: [
      "politic",
      "international relations",
      "diplomacy",
      "public policy",
      "global affairs",
      "سياس",
      "علاقات دولية",
      "دبلوماسية",
      "سياسة عامة",
    ],
  },
  {
    id: "journalism",
    name: "Mass Communication & Media",
    name_ar: "الإعلام والصحافة والاتصال الجماهيري",
    icon: "📰",
    color: "#E11D48",
    keywords: [
      "journalism",
      "mass comm",
      "media",
      "communication",
      "broadcasting",
      "إعلام",
      "صحافة",
      "اتصال",
      "إذاعة وتلفزيون",
    ],
  },
  {
    id: "graphic-design",
    name: "Graphic Design & Applied Arts",
    name_ar: "تصميم الجرافيك والفنون التطبيقية",
    icon: "🎨",
    color: "#99582a",
    keywords: [
      "design",
      "applied arts",
      "fine arts",
      "graphic",
      "visual arts",
      "فنون",
      "تصميم",
      "فنون تطبيقية",
      "جرافيك",
      "فنون جميلة",
    ],
  },
  {
    id: "biotechnology",
    name: "Biotechnology & Life Sciences",
    name_ar: "التكنولوجيا الحيوية والعلوم البيولوجية",
    icon: "🧬",
    color: "#bb9457",
    keywords: [
      "biotech",
      "biological",
      "biochemistry",
      "molecular",
      "genetics",
      "حيوية",
      "بيوتكنولوجي",
      "كيمياء حيوية",
      "وراثة",
    ],
  },
  {
    id: "nanotechnology",
    name: "Nanotechnology & Advanced Materials",
    name_ar: "تكنولوجيا النانو وهندسة المواد",
    icon: "🔬",
    color: "#ffe6a7",
    keywords: [
      "nano",
      "nanotech",
      "advanced materials",
      "materials engineering",
      "نانو",
      "مواد متقدمة",
      "هندسة المواد",
    ],
  },
  {
    id: "psychology",
    name: "Psychology & Behavioral Sciences",
    name_ar: "علم النفس والعلوم السلوكية والاجتماعية",
    icon: "🧠",
    color: "#E11D48",
    keywords: [
      "psycholog",
      "behavioral",
      "humanities",
      "social sciences",
      "arts",
      "نفس",
      "سلوك",
      "آداب",
      "علوم إنسانية",
      "علوم اجتماعية",
    ],
  },
  {
    id: "mechanical-eng",
    name: "Mechanical & Automotive Engineering",
    name_ar: "الهندسة الميكانيكية وهندسة السيارات",
    icon: "🔧",
    color: "#99582a",
    keywords: [
      "mechanic",
      "automotive",
      "thermal",
      "power",
      "production",
      "engineering",
      "ems",
      "ميكانيك",
      "سيارات",
      "طاقة",
      "هندسة",
      "إنتاج وتصميم",
    ],
  },
  {
    id: "media-eng",
    name: "Media Engineering & Digital Media",
    name_ar: "هندسة وتكنولوجيا الوسائط الرقمية",
    icon: "🎬",
    color: "#bb9457",
    keywords: [
      "media engineering",
      "met",
      "digital media",
      "multimedia",
      "game development",
      "media tech",
      "إعلام رقمي",
      "تكنولوجيا الإعلام",
      "هندسة الإعلام",
      "وسائط متعددة",
    ],
  },
];

interface MajorsClientProps {
  initialUniversities?: SlimSearchToken[];
}

export function MajorsClient({ initialUniversities = [] }: MajorsClientProps) {
  const { language, t } = useLanguage();
  const { index: universitiesDatabase } = useUniversitySearch(initialUniversities);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMajors, setExpandedMajors] = useState<Record<string, boolean>>({});
  const [selectedUniModal, setSelectedUniModal] = useState<UniversityData | null>(null);

  const getLangField = (obj: any, field: string): string => {
    if (!obj) return "";
    if (field === "name") {
      if (language === "ar") {
        return obj.nameAr || obj.name_ar || obj.nameEn || obj.name || "";
      }
      return obj.nameEn || obj.name || obj.nameAr || obj.name_ar || "";
    }
    if (field === "location" || field === "city") {
      if (language === "ar") {
        const val = obj.city_ar || obj.city || obj.governorate_ar || obj.governorate;
        return val || "مصر";
      }
      return obj.city || obj.governorate || obj.location || "Egypt";
    }
    if (field === "type") {
      const typeVal = obj.type || "";
      if (language === "ar") {
        if (typeVal === "PUBLIC") return "حكومية";
        if (typeVal === "PRIVATE") return "خاصة";
        if (typeVal === "NATIONAL") return "أهلية";
        if (typeVal === "INTERNATIONAL") return "دولية";
        if (typeVal === "TECHNOLOGICAL") return "تكنولوجية";
        return typeVal;
      }
      return typeVal;
    }
    if (field === "model" || field === "educationModel") {
      const model = obj.educationModel || obj.model || "EGYPTIAN";
      return model.charAt(0).toUpperCase() + model.slice(1).toLowerCase();
    }
    if (language === "ar" && obj[field + "_ar"]) return obj[field + "_ar"];
    if (language === "ar" && obj[field + "Ar"]) return obj[field + "Ar"];
    return obj[field + "En"] || obj[field] || "";
  };

  const isOfferingMajor = (u: any, major: MajorDefinition): boolean => {
    const textTokens: string[] = [];

    if (u.nameEn) textTokens.push(u.nameEn.toLowerCase());
    if (u.nameAr) textTokens.push(u.nameAr.toLowerCase());
    if (u.shortName) textTokens.push(u.shortName.toLowerCase());
    if (u.overviewEn) textTokens.push(u.overviewEn.toLowerCase());
    if (u.overviewAr) textTokens.push(u.overviewAr.toLowerCase());
    if (u.description) textTokens.push(u.description.toLowerCase());
    if (u.description_ar) textTokens.push(u.description_ar.toLowerCase());

    // Faculties strings
    if (Array.isArray(u.faculties)) {
      u.faculties.forEach((f: any) => {
        if (typeof f === "string") textTokens.push(f.toLowerCase());
        else if (f?.nameEn) textTokens.push(f.nameEn.toLowerCase());
      });
    }
    if (Array.isArray(u.faculties_ar)) {
      u.faculties_ar.forEach((f: any) => {
        if (typeof f === "string") textTokens.push(f.toLowerCase());
        else if (f?.nameAr) textTokens.push(f.nameAr.toLowerCase());
      });
    }

    // Structured Faculties & Departments
    if (Array.isArray(u.structured_faculties)) {
      u.structured_faculties.forEach((f: any) => {
        if (f.nameEn) textTokens.push(f.nameEn.toLowerCase());
        if (f.nameAr) textTokens.push(f.nameAr.toLowerCase());
        if (f.descriptionEn) textTokens.push(f.descriptionEn.toLowerCase());
        if (f.descriptionAr) textTokens.push(f.descriptionAr.toLowerCase());
        if (Array.isArray(f.departments)) {
          f.departments.forEach((d: string) => textTokens.push(d.toLowerCase()));
        }
      });
    }

    // Degree Programs
    if (Array.isArray(u.degreePrograms)) {
      u.degreePrograms.forEach((p: any) => {
        if (p.nameEn) textTokens.push(p.nameEn.toLowerCase());
        if (p.nameAr) textTokens.push(p.nameAr.toLowerCase());
      });
    }

    // Strengths
    if (Array.isArray(u.strengthsEn)) {
      u.strengthsEn.forEach((s: string) => textTokens.push(s.toLowerCase()));
    }
    if (Array.isArray(u.strengthsAr)) {
      u.strengthsAr.forEach((s: string) => textTokens.push(s.toLowerCase()));
    }

    const corpus = textTokens.join(" ");

    // Check direct name match
    if (corpus.includes(major.name.toLowerCase())) return true;
    if (major.name_ar && corpus.includes(major.name_ar.toLowerCase())) return true;

    // Check keywords
    if (major.keywords && major.keywords.length > 0) {
      return major.keywords.some((kw) => corpus.includes(kw.toLowerCase()));
    }

    return false;
  };

  const filteredMajors = useMemo(() => {
    if (!searchQuery.trim()) return majors;
    const q = searchQuery.toLowerCase();
    return majors.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.name_ar && m.name_ar.includes(q)) ||
        m.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const toggleExpand = (majorId: string) => {
    setExpandedMajors((prev) => ({
      ...prev,
      [majorId]: !prev[majorId],
    }));
  };

  return (
    <div className="majors-tab-container">
      {/* Page Mini Hero */}
      <div className="page-hero-mini">
        <div className="gradient-orb orb-mini-1"></div>
        <div className="gradient-orb orb-mini-2"></div>
        <div className="container">
          <h1 className="page-title animate-in">{t("Explore Majors")}</h1>
          <p className="page-subtitle animate-in">
            {t("Start from what you want to study — see every university that offers it.")}
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
              id="majorSearchInput"
              placeholder={
                language === "ar"
                  ? "ابحث عن تخصص (مثال: هندسة، طب، ذكاء اصطناعي، صيدلة)..."
                  : "Search majors (e.g. Computer Science, Mechanical Engineering)..."
              }
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="majors-grid" id="majorsGrid">
          {filteredMajors.map((major, index) => {
            const offeringUnis = universitiesDatabase.filter((u: any) => isOfferingMajor(u, major));
            const isExpanded = !!expandedMajors[major.id];

            return (
              <div
                key={major.id}
                className={`major-card animate-in ${isExpanded ? "expanded" : ""}`}
                data-major={major.id}
                style={{ animationDelay: `${(index % 6) * 50}ms` }}
              >
                <div className="major-card-header" onClick={() => toggleExpand(major.id)}>
                  <div className="major-card-title">
                    <span className="major-card-icon">{major.icon}</span>
                    <span className="major-card-name">
                      {language === "ar" ? major.name_ar : major.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="major-card-count">
                      {offeringUnis.length}{" "}
                      {language === "ar"
                        ? "جامعة"
                        : offeringUnis.length === 1
                        ? "university"
                        : "universities"}
                    </span>
                    <div className="major-card-toggle">{isExpanded ? "▲" : "▼"}</div>
                  </div>
                </div>

                <div className="major-card-body">
                  <div className="major-card-body-inner">
                    {offeringUnis.length === 0 ? (
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px 0" }}>
                        {language === "ar"
                          ? "يرجى مراجعة دليل الجامعات للبرامج الأكاديمية الجديدة."
                          : "Explore the directory for specific academic tracks."}
                      </div>
                    ) : (
                      offeringUnis.map((u: any) => (
                        <div
                          key={u.id || u.slug}
                          className="major-uni-item"
                          onClick={() => setSelectedUniModal(u)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="major-uni-info">
                            <span className="major-uni-emoji">{u.emoji || "🏛️"}</span>
                            <div>
                              <div className="major-uni-name" style={{ fontWeight: 600 }}>
                                {getLangField(u, "name")}
                              </div>
                              <div className="major-uni-meta">
                                📍 {getLangField(u, "location")} · 🏛️ {getLangField(u, "type")}
                              </div>
                            </div>
                          </div>
                          <button
                            className="view-details-btn"
                            style={{ fontSize: "12px", padding: "4px 8px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUniModal(u);
                            }}
                          >
                            {language === "ar" ? "التفاصيل" : "Details"} →
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
