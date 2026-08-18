"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession, signOut } from "@/lib/auth-client";
import { LogOut, User } from "lucide-react";

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { href: "/", label: t("navHome"), key: "home" },
    { href: "/universities", label: t("navUniversities"), key: "universities" },
    { href: "/compare", label: t("navCompare"), key: "compare" },
    { href: "/majors", label: t("navMajors"), key: "majors" },
    { href: "/dashboard", label: t("navDashboard"), key: "dashboard" },
    { href: "/about", label: t("navAbout"), key: "about" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      <div className="nav-brand">
        <Link
          href="/"
          className="logo-image"
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <img
            src={language === "ar" ? "/logo_ar.jpeg" : "/logo_en.jpeg"}
            alt={language === "ar" ? "بوابة الجامعة" : "University Gate"}
            style={{ height: "60px", borderRadius: "10px", objectFit: "contain" }}
          />
        </Link>
        <span className="logo-badge">{language === "ar" ? "مصر" : "Egypt"}</span>
      </div>

      <nav className={`nav-links ${mobileMenuOpen ? "open" : ""}`} id="navLinks">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`nav-link ${isActive(tab.href) ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Authentication Navigation Control */}
        {session?.user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link
              href="/dashboard"
              className="auth-nav-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "var(--radius-full)",
                background: "rgba(124, 58, 237, 0.15)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#c084fc",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <User className="w-3.5 h-3.5" />
              <span>{session.user.name?.split(" ")[0] || session.user.email?.split("@")[0] || t("navDashboard")}</span>
            </Link>

            <button
              className="auth-nav-btn"
              onClick={handleLogout}
              title={t("navLogout")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "7px 14px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--border)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{t("navLogout")}</span>
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="auth-nav-btn"
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-full)",
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            {t("navLogin")}
          </Link>
        )}

        <button className="lang-toggle" onClick={toggleLanguage} aria-label="Toggle language">
          <span className="lang-text">{language === "en" ? "عربي" : "English"}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </button>

        <button
          className={`nav-mobile-toggle ${mobileMenuOpen ? "open" : ""}`}
          id="mobileToggle"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
