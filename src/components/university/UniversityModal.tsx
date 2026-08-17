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
  Briefcase,
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

interface UniversityModalProps {
  uni: UniversityData | null;
  onClose: () => void;
  onSelectMajor?: (majorName: string) => void;
}

export function UniversityModal({ uni, onClose, onSelectMajor }: UniversityModalProps) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";

  const { selectedUniversities, toggleUniversity } = useCompareStore();
  const { bookmarks, createBookmark, deleteBookmark } = useBookmarks();

  const [expandedFaculties, setExpandedFaculties] = useState<Record<number, boolean>>({ 0: true });
  const [activeTab, setActiveTab] = useState<"faculties" | "admission" | "facilities" | "contact">("faculties");
  const [allExpanded, setAllExpanded] = useState(false);
  const [fullUni, setFullUni] = useState<any>(uni);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const uniIdStr = String(uni?.id || "");
  const isCompared = selectedUniversities.some((u) => String(u.id) === uniIdStr);
  const existingBookmark = bookmarks.find(
    (b) => String(b.universityId) === uniIdStr || String(b.university?.id) === uniIdStr
  );
  const isBookmarked = !!existingBookmark;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      id="modalOverlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "modalOverlay") onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200"
        id="uniModal"
      >
        {/* Sticky Header with Hero Accent Gradient */}
        <div
          className="relative px-6 py-6 sm:px-8 sm:py-7 text-white shrink-0 border-b border-white/10 overflow-hidden"
          style={{
            background: displayUni.accentGradient || "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #DB2777 100%)",
          }}
        >
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-10 w-36 h-36 rounded-full bg-black/20 blur-xl pointer-events-none"></div>

          {/* Floating Actions Top Right */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-20">
            {/* Quick Compare Button */}
            <button
              onClick={handleCompareToggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border ${
                isCompared
                  ? "bg-purple-600 border-purple-400 text-white shadow-lg"
                  : "bg-black/30 hover:bg-black/50 border-white/20 text-white/90"
              }`}
              title={isArabic ? "مقارنة الجامعة" : "Compare university"}
            >
              <Scale className="w-4 h-4" />
            </button>

            {/* Quick Bookmark Button */}
            <button
              onClick={handleBookmarkToggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border ${
                isBookmarked
                  ? "bg-rose-600 border-rose-400 text-white shadow-lg"
                  : "bg-black/30 hover:bg-black/50 border-white/20 text-white/90"
              }`}
              title={isArabic ? "إضافة للمفضلة" : "Bookmark university"}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? "fill-white" : ""}`} />
            </button>

            {/* Close Button */}
            <button
              className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Header Content */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pr-24 sm:pr-28">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl sm:text-5xl shadow-xl shrink-0">
              {displayUni.emoji || "🏛️"}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 shadow-xs">
                  <span>{displayUni.modelEmoji || "🎓"}</span>
                  <span>
                    {displayUni.educationModel || getLangField("model") || "University"} {isArabic ? "نموذج" : "Model"}
                  </span>
                </span>

                {rank && rank !== "N/A" && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-400/30 text-amber-200 border border-amber-300/50 backdrop-blur-md px-2.5 py-1 rounded-full font-bold">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    {rank}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0 drop-shadow-sm truncate">
                {uniName}
              </h2>

              {subTitleName && (
                <div className="text-sm font-medium text-white/80 truncate">{subTitleName}</div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-xs bg-black/25 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-white/90 border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                  {getLangField("location")}
                </span>

                <span className="inline-flex items-center gap-1 text-xs bg-black/25 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-white/90 border border-white/10">
                  <Building2 className="w-3.5 h-3.5 text-cyan-300" />
                  {displayUni.type || "University"}
                </span>

                {establishedYear && (
                  <span className="inline-flex items-center gap-1 text-xs bg-black/25 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-white/90 border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-purple-300" />
                    {isArabic ? `تأسست ${establishedYear}` : `Est. ${establishedYear}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Sticky Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto scrollbar-none shrink-0">
          <button
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "faculties"
                ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={handleFacultiesTabClick}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isArabic ? "الكليات والبرامج الأكاديمية" : "Faculties & Programs"}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 font-mono font-bold">
              {facultyItems.length}
            </span>
          </button>

          <button
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "admission"
                ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("admission")}
          >
            <DollarSign className="w-4 h-4" />
            <span>{isArabic ? "المصروفات والقبول" : "Tuition & Admissions"}</span>
          </button>

          <button
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "facilities"
                ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("facilities")}
          >
            <Award className="w-4 h-4" />
            <span>{isArabic ? "الاعتمادات والمميزات" : "Accreditation & Strengths"}</span>
          </button>

          <button
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "contact"
                ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("contact")}
          >
            <Compass className="w-4 h-4" />
            <span>{isArabic ? "التواصل والموقع" : "Contact & Location"}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-200 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 text-center shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                {isArabic ? "سنة التأسيس" : "Founded"}
              </div>
              <div className="text-base font-extrabold text-slate-100 mt-1">{establishedYear || "N/A"}</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 text-center shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                {isArabic ? "التصنيف الدولي" : "QS Ranking"}
              </div>
              <div className="text-base font-extrabold text-amber-400 mt-1 truncate">
                {rank ? (String(rank).includes("#1") ? "#1 in Egypt" : String(rank).split("/")[0]) : "Ranked"}
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 text-center shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                {isArabic ? "النوع الأكاديمي" : "Institution Type"}
              </div>
              <div className="text-base font-extrabold text-purple-400 mt-1">{displayUni.type || "University"}</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 text-center shadow-xs">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                {isArabic ? "المدينة والحرم" : "City"}
              </div>
              <div className="text-base font-extrabold text-emerald-400 mt-1 truncate">
                {getLangField("city")}
              </div>
            </div>
          </div>

          {/* Overview Statement Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-2">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{isArabic ? "نبذة عن الجامعة ورؤيتها" : "About University & Mission"}</span>
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 font-normal">
              {getLangField("overview") || getLangField("description")}
            </p>
          </div>

          {/* TAB 1: FACULTIES & ACCORDION */}
          {activeTab === "faculties" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  <span>{isArabic ? "الكليات والأقسام الأكاديمية" : "Academic Faculties & Departments"}</span>
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
                  const programs = fac.programs || [];

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? "bg-slate-900/90 border-purple-500/50 shadow-md shadow-purple-500/5 ring-1 ring-purple-500/20"
                          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        onClick={() => toggleFaculty(idx)}
                        className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 font-extrabold flex items-center justify-center text-sm border border-purple-500/20 shadow-xs">
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
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                          {fac.description && (
                            <p className="text-xs text-slate-300 leading-relaxed font-normal">{fac.description}</p>
                          )}

                          {programs.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-cyan-400 tracking-wide uppercase flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{isArabic ? "البرامج الأكاديمية المتخصصة:" : "Specialized Degree Programs:"}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {programs.map((prog: any, pIdx: number) => {
                                  const progName = isArabic && prog.nameAr ? prog.nameAr : prog.nameEn || prog.name || "";
                                  const tuition = prog.tuitionEgpPerYear
                                    ? `${(prog.tuitionEgpPerYear / 1000).toLocaleString()}K EGP`
                                    : null;
                                  return (
                                    <div
                                      key={pIdx}
                                      onClick={() => {
                                        if (onSelectMajor) onSelectMajor(progName);
                                        onClose();
                                      }}
                                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                                          {progName}
                                        </div>
                                        {prog.degreeType && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                                            {prog.degreeType}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                                        {prog.durationYears && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            {prog.durationYears} {isArabic ? "سنوات" : "Yrs"}
                                          </span>
                                        )}
                                        {tuition && (
                                          <span className="text-emerald-400 font-semibold">{tuition}/yr</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : depts.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-cyan-400 tracking-wide uppercase">
                                🎯 {isArabic ? "الأقسام والبرامج الأكاديمية (اضغط للتصفح):" : "Offered Programs (Click to Explore):"}
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <DollarSign className="w-5 h-5" />
                    <span>{isArabic ? "المصروفات السنوية التقديرية" : "Estimated Tuition Range"}</span>
                  </div>
                  <p className="text-lg font-extrabold text-emerald-300">
                    {displayUni.tuition || (isArabic ? "يرجى مراجعة إدارة القبول بالجامعة" : "Refer to official website")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isArabic
                      ? "المصروفات قد تختلف حسب الكلية ونظام الساعات المعتمدة."
                      : "Tuition varies by faculty and credit-hour system."}
                  </p>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
                    <Users className="w-5 h-5" />
                    <span>{isArabic ? "مجتمع الطلاب" : "Student Body"}</span>
                  </div>
                  <p className="text-base font-bold text-slate-200">
                    {displayUni.students || (isArabic ? "أكثر من 10,000 طالب وطالبة" : "10,000+ Students")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isArabic ? "بيئة تعليمية متعددة الثقافات" : "Multicultural campus environment"}
                  </p>
                </div>
              </div>

              {/* Requirement Cards */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-purple-400" />
                  <span>{isArabic ? "الشهادات المقبولة وشروط الالتحاق" : "Accepted High School Certificates"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-cyan-400">🇪🇬 {isArabic ? "الثانوية العامة" : "Thanaweya Amma"}</div>
                    <p className="text-xs text-slate-300">
                      {isArabic ? "الحد الأدنى المعلن من وزارة التعليم العالي" : "According to Ministry of Higher Education quotas"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-purple-400">🇬🇧 IGCSE / British</div>
                    <p className="text-xs text-slate-300">
                      {isArabic ? "8 مواد O-Level + مواد متقدمة AS/A-Level" : "8 O-Levels + relevant AS/A2 subjects"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-amber-400">🇺🇸 American Diploma</div>
                    <p className="text-xs text-slate-300">
                      {isArabic ? "GPA + درجات اختبارات SAT / ACT / EST" : "High School GPA + SAT / ACT / EST scores"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STRENGTHS & ACCREDITATIONS */}
          {activeTab === "facilities" && (
            <div className="space-y-6">
              {accreditations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isArabic ? "الاعتمادات الدولية والمحلية المعتمدة" : "Recognized International Accreditations"}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accreditations.map((acc: any, i: number) => {
                      const accName = typeof acc === "string" ? acc : acc.name || acc.fullName || "";
                      const accFull = typeof acc === "object" ? acc.fullName : null;
                      return (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-emerald-200">{accName}</div>
                            {accFull && <div className="text-[11px] text-emerald-400/80">{accFull}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {strengths.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{isArabic ? "أبرز نقاط القوة والمزايا التنافسية" : "Key Institutional Strengths"}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {strengths.map((s: string, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 font-medium leading-relaxed">{s}</span>
                      </div>
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
                  <span>{isArabic ? "عنوان الحرم الجامعي" : "Campus Address"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{isArabic ? "أرقام الهاتف والخط الساخن" : "Telephone Lines"}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {displayUni.phones.map((phone: string, pIdx: number) => (
                      <div key={pIdx} className="flex items-center justify-between text-xs text-slate-300">
                        <span>{phone}</span>
                        <button
                          onClick={() => handleCopy(phone, `phone-${pIdx}`)}
                          className="text-[11px] text-slate-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === `phone-${pIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {displayUni.emails && displayUni.emails.length > 0 && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{isArabic ? "البريد الإلكتروني للقبول" : "Email Inquiries"}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {displayUni.emails.map((email: string, eIdx: number) => (
                      <div key={eIdx} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate mr-2">{email}</span>
                        <button
                          onClick={() => handleCopy(email, `email-${eIdx}`)}
                          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedText === `email-${eIdx}` ? <Check className="w-3 h-3 text-rose-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Actions Glass Footer */}
        <div className="p-4 sm:p-5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div>
            <SuggestionDialog universityId={String(displayUni.id)} universityName={uniName} />
          </div>

          <div className="flex items-center gap-2.5">
            {displayUni.website && (
              <a
                href={displayUni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-500/25 cursor-pointer"
              >
                <span>{isArabic ? "زيارة الموقع الرسمي" : "Visit Official Website"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isArabic ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
