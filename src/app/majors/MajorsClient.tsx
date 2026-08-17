"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUniversitySearch } from "@/hooks/useUniversitySearch";
import { UniversityModal, type UniversityData } from "@/components/university/UniversityModal";
import type { SlimSearchToken } from "@/types/university.types";

const majors = [
  { name: "Computer Science", name_ar: "علوم الحاسب", icon: "💻", color: "#E11D48" },
  { name: "Artificial Intelligence", name_ar: "الذكاء الاصطناعي", icon: "🤖", color: "#99582a" },
  { name: "Industrial Engineering", name_ar: "هندسة صناعية", icon: "🏭", color: "#bb9457" },
  { name: "Business Administration", name_ar: "إدارة أعمال", icon: "📊", color: "#ffe6a7" },
  { name: "Pharmacy", name_ar: "صيدلة", icon: "💊", color: "#E11D48" },
  { name: "Architectural Engineering", name_ar: "هندسة معمارية", icon: "🏗️", color: "#99582a" },
  { name: "Mechatronics Engineering", name_ar: "هندسة الميكاترونكس", icon: "⚙️", color: "#bb9457" },
  { name: "Economics", name_ar: "اقتصاد", icon: "📈", color: "#ffe6a7" },
  { name: "Medicine", name_ar: "طب بشري", icon: "🩺", color: "#E11D48" },
  { name: "Dentistry", name_ar: "طب أسنان", icon: "🦷", color: "#99582a" },
  { name: "Law", name_ar: "حقوق", icon: "⚖️", color: "#bb9457" },
  { name: "Political Science", name_ar: "علوم سياسية", icon: "🏛️", color: "#ffe6a7" },
  { name: "Journalism", name_ar: "صحافة", icon: "📰", color: "#E11D48" },
  { name: "Graphic Design", name_ar: "تصميم جرافيك", icon: "🎨", color: "#99582a" },
  { name: "Biotechnology", name_ar: "تكنولوجيا حيوية", icon: "🧬", color: "#bb9457" },
  { name: "Nanotechnology", name_ar: "تكنولوجيا النانو", icon: "🔬", color: "#ffe6a7" },
  { name: "Psychology", name_ar: "علم نفس", icon: "🧠", color: "#E11D48" },
  { name: "Mechanical Engineering", name_ar: "هندسة ميكانيكية", icon: "🔧", color: "#99582a" },
  { name: "Media Engineering", name_ar: "هندسة الإعلام", icon: "🎬", color: "#bb9457" },
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

  const getLangField = (obj: any, field: string) =>
    language === "ar" && obj[field + "_ar"] ? obj[field + "_ar"] : obj[field];

  const filteredMajors = majors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.name_ar && m.name_ar.includes(searchQuery))
  );

  const toggleExpand = (majorName: string) => {
    setExpandedMajors((prev) => ({
      ...prev,
      [majorName]: !prev[majorName],
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
              placeholder={language === "ar" ? "ابحث عن تخصص (مثال: هندسة، طب، ذكاء اصطناعي)..." : "Search majors…"}
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
            const db = universitiesDatabase;
            const offeringUnis = db.filter((u: any) => {
              const facultiesList = u.faculties || [];
              const facultiesArList = u.faculties_ar || [];
              const searchKey = major.name.toLowerCase();
              const searchKeyAr = (major.name_ar || "").toLowerCase();
              const uNameEn = (u.nameEn || "").toLowerCase();
              const uNameAr = (u.nameAr || "");

              return (
                uNameEn.includes(searchKey) ||
                (searchKeyAr && uNameAr.includes(searchKeyAr)) ||
                facultiesList.some((f: any) =>
                  (typeof f === "string" ? f : f.nameEn || f.name || "")
                    .toLowerCase()
                    .includes(searchKey)
                ) ||
                (searchKeyAr && facultiesArList.some((f: any) =>
                  (typeof f === "string" ? f : f.nameAr || "")
                    .includes(searchKeyAr)
                ))
              );
            });

            const isExpanded = !!expandedMajors[major.name];

            return (
              <div
                key={major.name}
                className={`major-card animate-in ${isExpanded ? "expanded" : ""}`}
                data-major={major.name}
                style={{ animationDelay: `${(index % 6) * 50}ms` }}
              >
                <div className="major-card-header" onClick={() => toggleExpand(major.name)}>
                  <div className="major-card-title">
                    <span className="major-card-icon">{major.icon}</span>
                    <span className="major-card-name">{getLangField(major, "name")}</span>
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
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "10px 0" }}>
                        {language === "ar"
                          ? "يرجى مراجعة دليل الجامعات للحصول على القائمة التفصيلية."
                          : "Explore the directory for specific faculties."}
                      </div>
                    ) : (
                      offeringUnis.map((u: any) => (
                        <div
                          key={u.id}
                          className="major-uni-item"
                          onClick={() => setSelectedUniModal(u)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="major-uni-info">
                            <span className="major-uni-emoji">{u.emoji || "🏛️"}</span>
                            <div>
                              <div className="major-uni-name">{getLangField(u, "name")}</div>
                              <div className="major-uni-meta">
                                {getLangField(u, "location")} · {getLangField(u, "type")}
                              </div>
                            </div>
                          </div>
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
