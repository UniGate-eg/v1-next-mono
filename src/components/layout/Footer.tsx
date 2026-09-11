"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
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
          <Link href="/universities">{language === "ar" ? "الجامعات" : "Universities"}</Link>
          <Link href="/majors">{language === "ar" ? "التخصصات" : "Majors"}</Link>
          <Link href="/compare">{language === "ar" ? "مقارنة" : "Compare"}</Link>
          <Link href="/about">{language === "ar" ? "عن المنصة" : "About"}</Link>
          <Link href="/faq">{language === "ar" ? "الأسئلة الشائعة" : "FAQ & Guide"}</Link>
        </div>

        <div className="footer-links-group">
          <h4>{language === "ar" ? "أنواع الجامعات" : "University Types"}</h4>
          <Link href="/universities?type=PUBLIC">
            {language === "ar" ? "جامعات حكومية" : "Public Universities"}
          </Link>
          <Link href="/universities?type=PRIVATE">
            {language === "ar" ? "جامعات خاصة" : "Private Universities"}
          </Link>
          <Link href="/universities?type=NATIONAL">
            {language === "ar" ? "جامعات أهلية" : "National Universities"}
          </Link>
          <Link href="/universities?type=INTERNATIONAL">
            {language === "ar" ? "جامعات دولية" : "International Universities"}
          </Link>
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
                  <Link href="/about" className="footer-legal-link">
                    {language === "ar" ? "عن المنصة" : "About"}
                  </Link>
                </li>
                <li className="footer-legal-separator" aria-hidden="true">
                  |
                </li>
                <li className="footer-legal-item">
                  <Link href="/privacy" className="footer-legal-link">
                    {language === "ar" ? "الخصوصية" : "Privacy"}
                  </Link>
                </li>
                <li className="footer-legal-separator" aria-hidden="true">
                  |
                </li>
                <li className="footer-legal-item">
                  <Link href="/terms" className="footer-legal-link">
                    {language === "ar" ? "الشروط" : "Terms"}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="footer-legal-secondary">
            <button
              type="button"
              onClick={toggleLanguage}
              className="footer-locale-btn"
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
