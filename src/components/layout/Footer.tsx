"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { language } = useLanguage();
  const pathname = usePathname();

  // Do not render public Footer inside the Admin Portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="footer">
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
        <p>
          © {new Date().getFullYear()} UniGate (بوابة الجامعة).{" "}
          {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
        </p>
        <div className="footer-bottom-links">
          <Link href="/about">{language === "ar" ? "عن المنصة" : "About"}</Link>
          <Link href="/privacy">{language === "ar" ? "الخصوصية" : "Privacy"}</Link>
          <Link href="/terms">{language === "ar" ? "الشروط" : "Terms"}</Link>
        </div>
      </div>
    </footer>
  );
}
