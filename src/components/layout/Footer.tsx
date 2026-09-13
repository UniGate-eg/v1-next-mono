"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { UNIVERSITY_TYPES, UNIVERSITY_TYPE_META, toTypeParam } from "@/lib/university-type";
import { Globe, ArrowUp } from "lucide-react";

export function Footer() {
  const { language, toggleLanguage } = useLanguage();
  const pathname = usePathname();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Do not render public Footer inside the Admin Portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Link
              href="/"
              className="logo-image"
              style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <img
                src={language === "ar" ? "/logo_ar.jpeg" : "/logo_en.jpeg"}
                alt={language === "ar" ? "بوابة الجامعة" : "University Gate"}
                style={{ height: "70px", borderRadius: "10px", objectFit: "contain" }}
              />
            </Link>
            <span className="logo-badge">{language === "ar" ? "مصر" : "Egypt"}</span>
          </div>
          <p className="footer-tagline">
            {language === "ar"
              ? "دليلك الشامل لاختيار جامعتك في مصر. قارن، واكتشف، واختر بوضوح."
              : "Your comprehensive guide to universities. Compare, explore, and decide with clarity."}
          </p>
        </div>

        <div className="footer-links-group">
          <h4>{language === "ar" ? "استكشف" : "Explore"}</h4>
          <Link
            href="/universities"
            className="!text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors duration-150"
          >
            {language === "ar" ? "الجامعات" : "Universities"}
          </Link>
          <Link
            href="/majors"
            className="!text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors duration-150"
          >
            {language === "ar" ? "التخصصات" : "Majors"}
          </Link>
          <Link
            href="/compare"
            className="!text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors duration-150"
          >
            {language === "ar" ? "مقارنة" : "Compare"}
          </Link>
          <Link
            href="/about"
            className="!text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors duration-150"
          >
            {language === "ar" ? "عن المنصة" : "About"}
          </Link>
          <Link
            href="/faq"
            className="!text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors duration-150"
          >
            {language === "ar" ? "الأسئلة الشائعة" : "FAQ & Guide"}
          </Link>
        </div>

        <div className="footer-links-group">
          <h4>{language === "ar" ? "أنواع الجامعات" : "University Types"}</h4>
          {UNIVERSITY_TYPES.map((type) => {
            const meta = UNIVERSITY_TYPE_META[type];
            return (
              <Link
                key={type}
                href={`/universities?type=${toTypeParam(type)}`}
                className="!text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors duration-150"
              >
                {language === "ar" ? `جامعات ${meta.ar}` : `${meta.en} Universities`}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="container footer-bottom">
        <div className="footer-bottom-shimmer" aria-hidden="true" />
        <div className="footer-legal-bar">
          <div className="footer-legal-primary">
            <p className="footer-copyright">
              {language === "ar"
                ? "حقوق النشر © 2026 بوابة الجامعة (UniGate). جميع الحقوق محفوظة."
                : "Copyright © 2026 UniGate (بوابة الجامعة). All rights reserved."}
            </p>

            <nav
              className="footer-legal-nav"
              aria-label={language === "ar" ? "روابط قانونية ومعلوماتية" : "Legal and platform links"}
            >
              <ul className="footer-legal-list">
                <li className="footer-legal-item">
                  <Link
                    href="/about"
                    className="footer-legal-link !text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors"
                  >
                    {language === "ar" ? "عن المنصة" : "About"}
                  </Link>
                </li>
                <li className="footer-legal-separator" aria-hidden="true">
                  |
                </li>
                <li className="footer-legal-item">
                  <Link
                    href="/privacy"
                    className="footer-legal-link !text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors"
                  >
                    {language === "ar" ? "الخصوصية" : "Privacy"}
                  </Link>
                </li>
                <li className="footer-legal-separator" aria-hidden="true">
                  |
                </li>
                <li className="footer-legal-item">
                  <Link
                    href="/terms"
                    className="footer-legal-link !text-slate-400 hover:!text-white focus:!text-white visited:!text-slate-400 visited:hover:!text-white transition-colors"
                  >
                    {language === "ar" ? "الشروط" : "Terms"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="footer-legal-secondary">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleLanguage();
              }}
              className="footer-locale-btn !text-slate-300 hover:!text-white cursor-pointer"
              title={language === "ar" ? "التبديل إلى English" : "Switch to العربية"}
              aria-label={language === "ar" ? "اختيار اللغة: العربية" : "Select language: English"}
            >
              <Globe className="footer-locale-icon" aria-hidden="true" />
              <span>{language === "ar" ? "مصر (العربية)" : "Egypt (English)"}</span>
            </button>

            <div
              className="footer-status-pill"
              title={
                language === "ar"
                  ? "جميع خدمات القبول والجامعات متاحة"
                  : "All admissions & portal directories operational"
              }
            >
              <span className="footer-status-dot" aria-hidden="true">
                <span className="footer-status-dot-ping" />
                <span className="footer-status-dot-solid" />
              </span>
              <span>{language === "ar" ? "القبول ٢٠٢٦ متاح" : "Admissions 2026 Live"}</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="footer-back-to-top"
              title={language === "ar" ? "العودة إلى أعلى الصفحة" : "Scroll to top"}
              aria-label={language === "ar" ? "العودة إلى أعلى الصفحة" : "Scroll to top"}
            >
              <ArrowUp size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
