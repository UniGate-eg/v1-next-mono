"use client";

import React, { createContext, useState, useEffect, useContext } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, { en: string; ar: string }> = {
  navHome: { en: "Home", ar: "الرئيسية" },
  navUniversities: { en: "Universities", ar: "الجامعات" },
  navCompare: { en: "Compare", ar: "مقارنة" },
  navMajors: { en: "Majors", ar: "التخصصات" },
  navDashboard: { en: "Dashboard", ar: "مساحتي" },
  navAbout: { en: "About", ar: "عن المنصة" },
  navLogin: { en: "Log In", ar: "تسجيل الدخول" },
  navLogout: { en: "Log Out", ar: "تسجيل الخروج" },
  "All Universities": { en: "All Universities", ar: "جميع الجامعات" },
  "Browse and discover Egyptian universities. Filter by model, type, city — or search by name.": {
    en: "Browse and discover Egyptian universities. Filter by model, type, city — or search by name.",
    ar: "تصفح واكتشف الجامعات المصرية. فلتر حسب النموذج، النوع، المدينة — أو ابحث بالاسم.",
  },
  "Education Model": { en: "Education Model", ar: "نموذج التعليم" },
  Type: { en: "Type", ar: "النوع" },
  City: { en: "City", ar: "المدينة" },
  Sort: { en: "Sort", ar: "ترتيب" },
  Default: { en: "Default", ar: "افتراضي" },
  "Name A → Z": { en: "Name A → Z", ar: "الاسم أ → ي" },
  "Name Z → A": { en: "Name Z → A", ar: "الاسم ي → أ" },
  "Oldest first": { en: "Oldest first", ar: "الأقدم أولاً" },
  "Newest first": { en: "Newest first", ar: "الأحدث أولاً" },
  "Tuition: Low → High": { en: "Tuition: Low → High", ar: "المصروفات: منخفض → مرتفع" },
  "Tuition: High → Low": { en: "Tuition: High → Low", ar: "المصروفات: مرتفع → منخفض" },
  "Tuition Budget (EGP/year)": { en: "Tuition Budget (EGP/year)", ar: "ميزانية المصروفات (ج.م/سنة)" },
  "Clear all filters": { en: "Clear all filters", ar: "مسح كل الفلاتر" },
  "No universities found": { en: "No universities found", ar: "لم يتم العثور على جامعات" },
  "Try adjusting your search or filters.": { en: "Try adjusting your search or filters.", ar: "حاول تعديل البحث أو الفلاتر." },
  "Reset all filters": { en: "Reset all filters", ar: "إعادة تعيين كل الفلاتر" },
  "Explore Majors": { en: "Explore Majors", ar: "استكشف التخصصات" },
  "Start from what you want to study — see every university that offers it.": {
    en: "Start from what you want to study — see every university that offers it.",
    ar: "ابدأ من المجال الذي ترغب بدراسته — واكتشف كل الجامعات التي توفره.",
  },
  American: { en: "American", ar: "أمريكي" },
  German: { en: "German", ar: "ألماني" },
  British: { en: "British", ar: "بريطاني" },
  Egyptian: { en: "Egyptian", ar: "مصري" },
  Private: { en: "Private", ar: "خاصة" },
  Public: { en: "Public", ar: "حكومية" },
  National: { en: "National", ar: "أهلية" },
  Cairo: { en: "Cairo", ar: "القاهرة" },
  Giza: { en: "Giza", ar: "الجيزة" },
  Alexandria: { en: "Alexandria", ar: "الإسكندرية" },
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("preferredLanguage") as Language | null;
    if (saved === "ar" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      if (saved === "ar") {
        document.body.classList.add("rtl");
      } else {
        document.body.classList.remove("rtl");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("preferredLanguage", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    if (lang === "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const t = (key: string) => {
    if (translations[key]) {
      return translations[key][language] || key;
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
