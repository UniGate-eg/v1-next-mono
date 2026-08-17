"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SuggestionDialog } from "@/components/university/SuggestionDialog";
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

interface UniversityModalProps {
  uni: UniversityData | null;
  onClose: () => void;
  onSelectMajor?: (majorName: string) => void;
}

export function UniversityModal({ uni, onClose, onSelectMajor }: UniversityModalProps) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";

  const [expandedFaculties, setExpandedFaculties] = useState<Record<number, boolean>>({ 0: true });
  const [activeTab, setActiveTab] = useState<"faculties" | "admission" | "facilities" | "contact">("faculties");
  const [allExpanded, setAllExpanded] = useState(false);
  const [fullUni, setFullUni] = useState<any>(uni);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (uni && (uni as any).slug) {
      setLoading(true);
      fetch(`/api/universities/${(uni as any).slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setFullUni(data.data);
          }
        })
        .catch((err) => console.warn("Failed to fetch full university details:", err))
        .finally(() => setLoading(false));
    } else {
      setFullUni(uni);
    }
  }, [uni]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (uni) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [uni]);

  if (!uni) return null;

  const displayUni = fullUni || uni;

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
        
        // Find programs under this faculty
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
      className="modal-overlay show animate-in"
      id="modalOverlay"
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
          maxWidth: "880px",
          maxHeight: "90vh",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header with Hero Gradient Accent */}
        <div
          className="modal-header relative p-6 sm:p-8 text-white border-b border-white/10"
          style={{
            background: displayUni.accentGradient || "linear-gradient(135deg, #4F46E5, #7C3AED, #DB2777)",
          }}
        >
          {/* Close Button */}
          <button
            className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 z-10"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-4xl sm:text-5xl shadow-lg shrink-0">
              {displayUni.emoji || "🏛️"}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/30">
                <span>{displayUni.modelEmoji || "🎓"}</span>
                <span>
                  {displayUni.educationModel || getLangField("model") || "University"} {isArabic ? "نموذج" : "Model"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0 drop-shadow-sm">
                {uniName}
              </h2>

              {subTitleName && (
                <div className="text-sm font-medium text-white/80">{subTitleName}</div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-xs bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white/90 border border-white/10">
                  <MapPin className="w-3.5 h-3.5" />
                  {getLangField("location")}
                </span>

                <span className="inline-flex items-center gap-1 text-xs bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white/90 border border-white/10">
                  <Building2 className="w-3.5 h-3.5" />
                  {displayUni.type || "University"}
                </span>

                {establishedYear && (
                  <span className="inline-flex items-center gap-1 text-xs bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-white/90 border border-white/10">
                    <Calendar className="w-3.5 h-3.5" />
                    {isArabic ? `تأسست ${establishedYear}` : `Est. ${establishedYear}`}
                  </span>
                )}

                {rank && rank !== "N/A" && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-400/30 text-amber-200 border border-amber-400/50 backdrop-blur-sm px-2.5 py-1 rounded-full font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    {rank}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-900/90 dark:bg-slate-950 border-b border-slate-800 overflow-x-auto scrollbar-none">
          <button
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "faculties"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={handleFacultiesTabClick}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isArabic ? "الكليات والأقسام الأكاديمية" : "Faculties & Departments"}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 font-mono">
              {facultyItems.length}
            </span>
          </button>

          <button
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "admission"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("admission")}
          >
            <Award className="w-4 h-4" />
            <span>{isArabic ? "القبول والمصروفات" : "Tuition & Admissions"}</span>
          </button>

          <button
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "facilities"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("facilities")}
          >
            <Building2 className="w-4 h-4" />
            <span>{isArabic ? "المميزات والاعتمادات" : "Strengths & Accreditation"}</span>
          </button>

          <button
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "contact"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("contact")}
          >
            <Phone className="w-4 h-4" />
            <span>{isArabic ? "التواصل والموقع" : "Contact & Campus"}</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="modal-content flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-200">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-xs text-slate-400 font-medium">{isArabic ? "سنة التأسيس" : "Founded"}</div>
              <div className="text-base font-bold text-slate-100 mt-1">{establishedYear || "N/A"}</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-xs text-slate-400 font-medium">{isArabic ? "التصنيف" : "QS Ranking"}</div>
              <div className="text-base font-bold text-amber-400 mt-1 truncate">
                {rank ? (String(rank).includes("#1") ? "#1 in Egypt" : String(rank).split("/")[0]) : "Ranked"}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-xs text-slate-400 font-medium">{isArabic ? "نوع المؤسسة" : "Institution Type"}</div>
              <div className="text-base font-bold text-purple-400 mt-1">{displayUni.type || "University"}</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-xs text-slate-400 font-medium">{isArabic ? "المدينة" : "City"}</div>
              <div className="text-base font-bold text-emerald-400 mt-1 truncate">
                {getLangField("city")}
              </div>
            </div>
          </div>

          {/* Overview Paragraph */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
              {isArabic ? "نبذة عن الجامعة" : "About the University"}
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {getLangField("overview") || getLangField("description")}
            </p>
          </div>

          {/* TAB 1: FACULTIES & ACCORDION */}
          {activeTab === "faculties" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  <span>{isArabic ? "الكليات والأقسام التابعة" : "Academic Faculties & Departments"}</span>
                </h3>

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
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                >
                  {allExpanded ? (isArabic ? "طي الكل" : "Collapse All") : (isArabic ? "توسيع الكل" : "Expand All")}
                </button>
              </div>

              <div className="space-y-3">
                {facultyItems.map((fac: any, idx: number) => {
                  const isExpanded = !!expandedFaculties[idx];
                  const depts = fac.departments || [];

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? "bg-slate-900/90 border-purple-500/50 shadow-md shadow-purple-500/5"
                          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        onClick={() => toggleFaculty(idx)}
                        className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/20">
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-100">{fac.name}</h4>
                            {fac.dean && (
                              <div className="text-xs text-amber-400 font-medium mt-0.5">
                                👨‍🏫 {isArabic ? "العميد:" : "Dean:"} {fac.dean}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {depts.length > 0 && (
                            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                              {depts.length} {isArabic ? "برنامج / قسم" : "Programs"}
                            </span>
                          )}
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                          {fac.description && (
                            <p className="text-xs text-slate-300 leading-relaxed">{fac.description}</p>
                          )}

                          {depts.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-cyan-400 tracking-wide uppercase">
                                🎯 {isArabic ? "الأقسام والبرامج الأكاديمية (اضغط للاستعراض):" : "Academic Programs (Click to Explore):"}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {depts.map((d: any, dIdx: number) => {
                                  const dStr = typeof d === "string" ? d : d.name || "";
                                  return (
                                    <button
                                      key={dIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onSelectMajor) onSelectMajor(dStr);
                                        onClose();
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-900/30 hover:bg-purple-800/50 text-purple-200 border border-purple-500/40 hover:border-cyan-400 transition-all cursor-pointer hover:scale-102"
                                    >
                                      <span className="text-[10px] text-cyan-400">✦</span>
                                      <span>{dStr}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic">
                              {isArabic
                                ? "تواصل مع شؤون الطلاب لمعرفة التخصصات الدقيقة لهذه الكلية."
                                : "Contact faculty admissions for detailed major programs."}
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

          {/* TAB 2: ADMISSION & TUITION */}
          {activeTab === "admission" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="text-2xl">💵</div>
                <h4 className="text-sm font-bold text-slate-200">
                  {isArabic ? "المصروفات السنوية التقديرية" : "Estimated Tuition Fees"}
                </h4>
                <p className="text-base font-extrabold text-emerald-400">
                  {displayUni.tuition || (isArabic ? "يرجى مراجعة إدارة القبول بالجامعة" : "Refer to official website")}
                </p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="text-2xl">👥</div>
                <h4 className="text-sm font-bold text-slate-200">
                  {isArabic ? "مجتمع الطلاب" : "Student Body"}
                </h4>
                <p className="text-sm text-slate-300">
                  {displayUni.students || (isArabic ? "أكثر من 10,000 طالب وطالبة" : "10,000+ Students")}
                </p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="text-2xl">📜</div>
                <h4 className="text-sm font-bold text-slate-200">
                  {isArabic ? "شروط القبول والشهادات" : "Admission Requirements"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? "شهادة الثانوية العامة أو ما يعادلها (IGCSE, American Diploma, IB) مع استيفاء الحد الأدنى للدرجات واجتياز اختبارات القبول."
                    : "Secondary School Certificate (Thanaweya Amma) or international equivalents (IG, SAT/ACT, IB) + Entrance Exams."}
                </p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="text-2xl">🎁</div>
                <h4 className="text-sm font-bold text-slate-200">
                  {isArabic ? "المنح الدراسية والتفوق" : "Scholarships & Grants"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isArabic
                    ? "منح للمتفوقين أكاديمياً ورياضياً تغطي ما بين 25% وحتى 100% من المصروفات السنوية."
                    : "Merit-based scholarships and athletic grants covering up to 100% of annual tuition fees."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STRENGTHS & ACCREDITATIONS */}
          {activeTab === "facilities" && (
            <div className="space-y-5">
              {accreditations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                    {isArabic ? "الاعتمادات الدولية والمحلية" : "Accreditations & Recognitions"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {accreditations.map((acc: any, i: number) => {
                      const accName = typeof acc === "string" ? acc : acc.name || acc.fullName || "";
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{accName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {strengths.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
                    {isArabic ? "أبرز نقاط القوة والمزايا" : "Key Strengths & Highlights"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700/80 text-slate-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTACT & LOCATION */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{isArabic ? "عنوان الحرم الجامعي" : "Campus Location"}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {getLangField("address") || getLangField("location")}
                </p>
              </div>

              {displayUni.website && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    <span>{isArabic ? "الموقع الرسمي" : "Official Website"}</span>
                  </div>
                  <a
                    href={displayUni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-300 hover:underline break-all inline-flex items-center gap-1"
                  >
                    <span>{displayUni.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {displayUni.phones && displayUni.phones.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{isArabic ? "أرقام الهاتف والخط الساخن" : "Telephone & Hotline"}</span>
                  </div>
                  <p className="text-xs text-slate-300">{displayUni.phones.join(" · ")}</p>
                </div>
              )}

              {displayUni.emails && displayUni.emails.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{isArabic ? "البريد الإلكتروني" : "Email Admissions"}</span>
                  </div>
                  <p className="text-xs text-slate-300 break-all">{displayUni.emails.join(" · ")}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Toolbar */}
        <div className="modal-footer p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <SuggestionDialog universityId={String(displayUni.id)} universityName={uniName} />
          </div>

          <div className="flex items-center gap-3">
            {displayUni.website && (
              <a
                href={displayUni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
              >
                <span>{isArabic ? "زيارة الموقع الرسمي" : "Visit Official Website"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
