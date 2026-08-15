"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { language } = useLanguage();

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
          <h4>{language === "ar" ? "المصادر" : "Resources"}</h4>
          <Link href="/universities">{language === "ar" ? "دليل الطالب" : "Student Guide"}</Link>
          <Link href="/about">{language === "ar" ? "الأسئلة الشائعة" : "FAQ"}</Link>
          <Link href="/about">{language === "ar" ? "اتصل بنا" : "Contact"}</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 {language === "ar" ? "بوابة الجامعة (University Gate)" : "University Gate"}.{" "}
          {language === "ar"
            ? "دليلك الشامل لاختيار جامعتك."
            : "Your comprehensive guide to universities."}{" "}
          Made by{" "}
          <a
            href="https://gizahost.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            GizaHost
          </a>
        </p>
      </div>
    </footer>
  );
}
