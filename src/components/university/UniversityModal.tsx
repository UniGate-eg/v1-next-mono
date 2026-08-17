"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SuggestionDialog } from "@/components/university/SuggestionDialog";

export interface UniversityData {
  id: string | number;
  slug?: string;
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
  const [fullUni, setFullUni] = useState<any>(uni);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (uni && (uni as any).slug && !(uni as any).faculties && !(uni as any).strengthsEn) {
      setLoading(true);
      fetch(`/api/universities/${(uni as any).slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setFullUni(data.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setFullUni(uni);
    }
  }, [uni]);

  if (!uni) return null;

  const displayUni = fullUni || uni;

  const getLangField = (fieldName: string) => {
    const uniAny = displayUni as any;
    if (language === "ar") {
      if (uniAny[fieldName + "_ar"]) return uniAny[fieldName + "_ar"];
      if (uniAny[fieldName + "Ar"]) return uniAny[fieldName + "Ar"];
    }
    if (uniAny[fieldName + "En"]) return uniAny[fieldName + "En"];
    return uniAny[fieldName] || "";
  };

  const getLangArray = (fieldName: string): string[] => {
    const uniAny = displayUni as any;
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

  const structuredFaculties = displayUni.structured_faculties || displayUni.faculties || [];
  const flatFaculties = getLangArray("faculties");
  const flatMajors = getLangArray("majors") || getLangArray("degreePrograms");

  const facultyItems = useMemo(() => {
    if (structuredFaculties.length > 0) {
      return structuredFaculties.map((fac: any) => ({
        name: language === "ar" && fac.name_ar ? fac.name_ar : fac.name_en,
        dean: fac.dean_name,
        description: language === "ar" && fac.description_ar ? fac.description_ar : fac.description_en,
        departments: fac.departments || [],
      }));
    }

    if (flatFaculties.length > 0) {
      return flatFaculties.map((f: any) => ({
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
      facultyItems.forEach((_: any, idx: number) => {
        newExpanded[idx] = nextState;
      });
      setExpandedFaculties(newExpanded);
    }
  };

  const uniName = getLangField("name") || displayUni.nameEn || displayUni.name || "";

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
          style={{ background: displayUni.accentGradient || "linear-gradient(135deg, #7C3AED, #EC4899)" }}
        >
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
          <div className="modal-header-content">
            <div className="modal-emoji">{displayUni.emoji || "🏛️"}</div>
            <div>
              <span className="modal-model-badge">
                {displayUni.modelEmoji || "🎓"} {getLangField("model") || displayUni.type || "University"}
              </span>
              <h2 className="modal-title">{uniName}</h2>
              <div className="modal-meta">
                <span>📍 {getLangField("location") || displayUni.governorate || "Egypt"}</span>
                <span>🏛️ {getLangField("type") || displayUni.type}</span>
                {(displayUni.founded || displayUni.established) && <span>📅 Est. {displayUni.founded || displayUni.established}</span>}
                {displayUni.qs_ranking && displayUni.qs_ranking !== "N/A" && (
                  <span className="qs-rank-badge">🏆 {displayUni.qs_ranking}</span>
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
            <p>{getLangField("overview") || getLangField("description") || displayUni.description}</p>
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
                    facultyItems.forEach((_: any, idx: number) => {
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
                {facultyItems.map((fac: any, idx: number) => {
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
                  <p>{displayUni.students || "~12,000+ Students"}</p>
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
              {displayUni.international_accreditations && displayUni.international_accreditations.length > 0 && (
                <div>
                  <h4>{language === "ar" ? "الاعتمادات الدولية والمحلية" : "Accreditations & Recognitions"}</h4>
                  <div className="depts-tags" style={{ marginTop: "8px" }}>
                    {displayUni.international_accreditations.map((acc: any, i: number) => (
                      <span key={i} className="dept-tag" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.4)", color: "#10B981" }}>
                        ✅ {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {displayUni.strengths && displayUni.strengths.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <h4>{language === "ar" ? "أبرز نقاط القوة والمزايا" : "Key Strengths & Highlights"}</h4>
                  <div className="depts-tags" style={{ marginTop: "8px" }}>
                    {getLangArray("strengths").map((str: any, i: number) => (
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
                    <p>{getLangField("address") || getLangField("location") || displayUni.governorate}</p>
                  </div>
                </div>

                {displayUni.website && (
                  <div className="contact-item">
                    <span className="contact-icon">🌐</span>
                    <div>
                      <strong>{language === "ar" ? "الموقع الرسمي:" : "Official Website:"}</strong>
                      <p>
                        <a href={displayUni.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-light)", textDecoration: "underline" }}>
                          {displayUni.website}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {displayUni.phones && displayUni.phones.length > 0 && (
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div>
                      <strong>{language === "ar" ? "أرقام الهاتف:" : "Telephone Lines:"}</strong>
                      <p>{displayUni.phones.join(" · ")}</p>
                    </div>
                  </div>
                )}

                {displayUni.emails && displayUni.emails.length > 0 && (
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <div>
                      <strong>{language === "ar" ? "البريد الإلكتروني:" : "Email Inquiries:"}</strong>
                      <p>{displayUni.emails.join(" · ")}</p>
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
            <SuggestionDialog universityId={String(displayUni.id)} universityName={uniName} />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {displayUni.website && (
              <a
                href={displayUni.website}
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
