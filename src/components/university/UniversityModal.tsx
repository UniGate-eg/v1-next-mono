"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SuggestionDialog } from "@/components/university/SuggestionDialog";

export interface UniversityData {
  id: string | number;
  name?: string;
  nameEn?: string;
  name_ar?: string;
  nameAr?: string;
  shortName?: string;
  emoji?: string;
  model?: string;
  model_ar?: string;
  modelEmoji?: string;
  location?: string;
  location_ar?: string;
  city?: string;
  city_ar?: string;
  governorate?: string;
  type?: string;
  type_ar?: string;
  founded?: number;
  established?: number | null;
  tuition?: string;
  tuition_ar?: string;
  students?: string;
  description?: string | null;
  description_ar?: string | null;
  overview?: string;
  overview_ar?: string;
  strengths?: string[];
  strengths_ar?: string[];
  faculties?: string[];
  faculties_ar?: string[];
  majors?: any[];
  accentGradient?: string;
  featured?: boolean;
  qs_ranking?: string;
  the_ranking?: string;
  address?: string;
  address_ar?: string;
  phones?: string[];
  emails?: string[];
  social_links?: Record<string, string>;
  international_accreditations?: string[];
  structured_faculties?: any[];
  website?: string | null;
}

interface UniversityModalProps {
  uni: UniversityData | null;
  onClose: () => void;
  onSelectMajor?: (majorName: string) => void;
}

export function UniversityModal({
  uni,
  onClose,
  onSelectMajor,
}: UniversityModalProps) {
  const { language } = useLanguage();
  const [expandedFaculties, setExpandedFaculties] = useState<Record<number, boolean>>({ 0: true });
  const [activeTab, setActiveTab] = useState<"faculties" | "admission" | "facilities" | "contact">("faculties");
  const [allExpanded, setAllExpanded] = useState(false);

  if (!uni) return null;

  const getLangField = (fieldName: string) => {
    const uniAny = uni as any;
    if (language === "ar") {
      if (uniAny[fieldName + "_ar"]) return uniAny[fieldName + "_ar"];
      if (uniAny[fieldName + "Ar"]) return uniAny[fieldName + "Ar"];
    }
    if (uniAny[fieldName + "En"]) return uniAny[fieldName + "En"];
    return uniAny[fieldName] || "";
  };

  const getLangArray = (fieldName: string): string[] => {
    const uniAny = uni as any;
    if (language === "ar") {
      if (Array.isArray(uniAny[fieldName + "_ar"])) return uniAny[fieldName + "_ar"];
      if (Array.isArray(uniAny[fieldName + "Ar"])) return uniAny[fieldName + "Ar"];
    }
    if (Array.isArray(uniAny[fieldName + "En"])) return uniAny[fieldName + "En"];
    if (Array.isArray(uniAny[fieldName])) {
      return uniAny[fieldName].map((item: any) =>
        typeof item === "string" ? item : (language === "ar" && item.nameAr ? item.nameAr : item.nameEn) || item.name || ""
      ).filter(Boolean);
    }
    return [];
  };

  const toggleFaculty = (idx: number) => {
    setExpandedFaculties((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const structuredFaculties = uni.structured_faculties || [];
  const flatFaculties = getLangArray("faculties");
  const flatMajors = getLangArray("majors");

  const facultyItems = useMemo(() => {
    if (structuredFaculties.length > 0) {
      return structuredFaculties.map((fac) => ({
        name: language === "ar" && fac.name_ar ? fac.name_ar : fac.name_en,
        dean: fac.dean_name,
        description: language === "ar" && fac.description_ar ? fac.description_ar : fac.description_en,
        departments: fac.departments || [],
      }));
    }

    if (flatFaculties.length > 0) {
      return flatFaculties.map((f) => ({
        name: f,
        dean: null,
        description: null,
        departments: [],
      }));
    }

    return [
      {
        name: language === "ar" ? "البرامج والتخصصات الأكاديمية" : "Academic Programs & Majors",
        dean: null,
        description: null,
        departments: flatMajors,
      },
    ];
  }, [structuredFaculties, flatFaculties, flatMajors, language]);

  const handleFacultiesTabClick = () => {
    if (activeTab !== "faculties") {
      setActiveTab("faculties");
    } else {
      const nextState = !allExpanded;
      setAllExpanded(nextState);
      const newExpanded: Record<number, boolean> = {};
      facultyItems.forEach((_, idx) => {
        newExpanded[idx] = nextState;
      });
      setExpandedFaculties(newExpanded);
    }
  };

  const uniName = getLangField("name") || uni.nameEn || uni.name || "";

  return (
    <div
      className="modal-overlay show"
      id="modalOverlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "modalOverlay") onClose();
      }}
    >
      <div className="modal-container">
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{ background: uni.accentGradient || "linear-gradient(135deg, #7C3AED, #EC4899)" }}
        >
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
          <div className="modal-header-content">
            <div className="modal-emoji">{uni.emoji || "🏛️"}</div>
            <div>
              <span className="modal-model-badge">
                {uni.modelEmoji || "🎓"} {getLangField("model") || uni.type || "University"}
              </span>
              <h2 className="modal-title">{uniName}</h2>
              <div className="modal-meta">
                <span>📍 {getLangField("location") || uni.governorate || "Egypt"}</span>
                <span>🏛️ {getLangField("type") || uni.type}</span>
                {(uni.founded || uni.established) && <span>📅 Est. {uni.founded || uni.established}</span>}
                {uni.qs_ranking && uni.qs_ranking !== "N/A" && (
                  <span className="qs-rank-badge">🏆 {uni.qs_ranking}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab-btn ${activeTab === "faculties" ? "active" : ""}`}
            onClick={handleFacultiesTabClick}
          >
            📚 {language === "ar" ? "الكليات والأقسام" : "Faculties & Programs"}
          </button>
          <button
            className={`modal-tab-btn ${activeTab === "admission" ? "active" : ""}`}
            onClick={() => setActiveTab("admission")}
          >
            💳 {language === "ar" ? "القبول والمصروفات" : "Tuition & Admissions"}
          </button>
          <button
            className={`modal-tab-btn ${activeTab === "facilities" ? "active" : ""}`}
            onClick={() => setActiveTab("facilities")}
          >
            🏛️ {language === "ar" ? "المرافق والاعتمادات" : "Accreditation & Life"}
          </button>
          <button
            className={`modal-tab-btn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            📞 {language === "ar" ? "التواصل والموقع" : "Contact & Location"}
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Overview summary */}
          <div className="modal-section modal-overview">
            <h3>{language === "ar" ? "نبذة عن الجامعة" : "About University"}</h3>
            <p>{getLangField("overview") || getLangField("description") || uni.description}</p>
          </div>

          {/* TAB 1: Faculties & Departments */}
          {activeTab === "faculties" && (
            <div className="modal-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3>{language === "ar" ? "الكليات والأقسام الأكاديمية" : "Faculties & Departments"}</h3>
                <button
                  onClick={() => {
                    const nextState = !allExpanded;
                    setAllExpanded(nextState);
                    const newExpanded: Record<number, boolean> = {};
                    facultyItems.forEach((_, idx) => {
                      newExpanded[idx] = nextState;
                    });
                    setExpandedFaculties(newExpanded);
                  }}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--primary-light)",
                    background: "rgba(124, 58, 237, 0.15)",
                    border: "1px solid var(--border)",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  {allExpanded ? (language === "ar" ? "طي الكل" : "Collapse All") : (language === "ar" ? "توسيع الكل" : "Expand All")}
                </button>
              </div>

              <div className="faculties-accordion">
                {facultyItems.map((fac, idx) => {
                  const isExpanded = !!expandedFaculties[idx];
                  return (
                    <div key={idx} className={`faculty-accordion-item ${isExpanded ? "expanded" : ""}`}>
                      <div className="faculty-accordion-header" onClick={() => toggleFaculty(idx)}>
                        <div className="faculty-header-left">
                          <span className="faculty-num">#{idx + 1}</span>
                          <span className="faculty-name">{fac.name}</span>
                        </div>
                        <span className="faculty-toggle-icon">{isExpanded ? "▲" : "▼"}</span>
                      </div>

                      {isExpanded && (
                        <div className="faculty-accordion-body">
                          {fac.dean && (
                            <div className="faculty-dean">
                              👨‍🏫 <strong>{language === "ar" ? "العميد:" : "Dean:"}</strong> {fac.dean}
                            </div>
                          )}
                          {fac.description && <p className="faculty-desc">{fac.description}</p>}
                          {fac.departments && fac.departments.length > 0 && (
                            <div className="faculty-departments">
                              <div className="faculty-depts-label">
                                {language === "ar" ? "الأقسام والبرامج:" : "Departments & Specializations:"}
                              </div>
                              <div className="depts-tags">
                                {fac.departments.map((dept: any, dIdx: number) => {
                                  const deptName = typeof dept === "string" ? dept : dept.name || "";
                                  return (
                                    <span
                                      key={dIdx}
                                      className="dept-tag"
                                      onClick={() => onSelectMajor && onSelectMajor(deptName)}
                                      style={{ cursor: onSelectMajor ? "pointer" : "default" }}
                                    >
                                      🎓 {deptName}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Tuition & Admission */}
          {activeTab === "admission" && (
            <div className="modal-section">
              <div className="admission-grid">
                <div className="admission-card">
                  <div className="admission-card-icon">💵</div>
                  <h4>{language === "ar" ? "المصروفات السنوية التقديرية" : "Estimated Tuition Fees"}</h4>
                  <p className="tuition-highlight">
                    {getLangField("tuition") || (language === "ar" ? "يرجى مراجعة الموقع الرسمي للجامعة" : "Refer to official website")}
                  </p>
                </div>

                <div className="admission-card">
                  <div className="admission-card-icon">👥</div>
                  <h4>{language === "ar" ? "أعداد الطلاب" : "Student Body"}</h4>
                  <p>{uni.students || "~12,000+ Students"}</p>
                </div>

                <div className="admission-card">
                  <div className="admission-card-icon">📜</div>
                  <h4>{language === "ar" ? "شروط القبول" : "Admission Criteria"}</h4>
                  <p>
                    {language === "ar"
                      ? "شهادة الثانوية العامة أو ما يعادلها (IGCSE, American Diploma, IB) + اختبارات القبول والمقابلة الشخصية."
                      : "General Secondary Certificate (Thanaweya Amma) or international equivalents (IG, SAT/ACT, IB) + University Entrance Exam."}
                  </p>
                </div>

                <div className="admission-card">
                  <div className="admission-card-icon">🎁</div>
                  <h4>{language === "ar" ? "المنح الدراسية" : "Scholarships"}</h4>
                  <p>
                    {language === "ar"
                      ? "منح للمتفوقين أكاديمياً ورياضياً تغطي حتى 100% من المصروفات الدراسية."
                      : "Academic merit scholarships and athletic grants covering up to 100% of annual tuition."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Facilities & Campus Life */}
          {activeTab === "facilities" && (
            <div className="modal-section space-y-4">
              {uni.international_accreditations && uni.international_accreditations.length > 0 && (
                <div>
                  <h4>{language === "ar" ? "الاعتمادات الدولية والمحلية" : "Accreditations & Recognitions"}</h4>
                  <div className="depts-tags" style={{ marginTop: "8px" }}>
                    {uni.international_accreditations.map((acc, i) => (
                      <span key={i} className="dept-tag" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.4)", color: "#10B981" }}>
                        ✅ {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {uni.strengths && uni.strengths.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <h4>{language === "ar" ? "أبرز نقاط القوة والمزايا" : "Key Strengths & Highlights"}</h4>
                  <div className="depts-tags" style={{ marginTop: "8px" }}>
                    {getLangArray("strengths").map((str, i) => (
                      <span key={i} className="strength-tag">
                        ✨ {str}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Contact & Location */}
          {activeTab === "contact" && (
            <div className="modal-section">
              <div className="contact-grid">
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <strong>{language === "ar" ? "العنوان:" : "Campus Address:"}</strong>
                    <p>{getLangField("address") || getLangField("location") || uni.governorate}</p>
                  </div>
                </div>

                {uni.website && (
                  <div className="contact-item">
                    <span className="contact-icon">🌐</span>
                    <div>
                      <strong>{language === "ar" ? "الموقع الرسمي:" : "Official Website:"}</strong>
                      <p>
                        <a href={uni.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-light)", textDecoration: "underline" }}>
                          {uni.website}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {uni.phones && uni.phones.length > 0 && (
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div>
                      <strong>{language === "ar" ? "أرقام الهاتف:" : "Telephone Lines:"}</strong>
                      <p>{uni.phones.join(" · ")}</p>
                    </div>
                  </div>
                )}

                {uni.emails && uni.emails.length > 0 && (
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <div>
                      <strong>{language === "ar" ? "البريد الإلكتروني:" : "Email Inquiries:"}</strong>
                      <p>{uni.emails.join(" · ")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <SuggestionDialog universityName={uniName} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {uni.website && (
              <a
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="view-details-btn"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", padding: "8px 20px" }}
              >
                {language === "ar" ? "زيارة الموقع الرسمي" : "Visit Official Website"} ↗
              </a>
            )}
            <button className="view-details-btn" onClick={onClose}>
              {language === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
