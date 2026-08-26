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

  // Do not render public Navbar inside the Admin Portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

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
      </div>

      <nav className="nav-tabs" id="navTabs">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`nav-tab ${isActive(tab.href) ? "active" : ""}`}
            data-page={tab.key}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="nav-actions">
        <button
          onClick={toggleLanguage}
          className="lang-toggle"
          id="langToggle"
          title="Toggle Language"
        >
          <span className="lang-text">{language === "ar" ? "English" : "عربي"}</span>
        </button>

        {!isPending && (
          <div className="nav-auth">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-glass border border-white/10 hover:border-primary/40 text-sm font-medium transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {session.user.name?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="max-w-[100px] truncate text-xs">
                    {session.user.name || session.user.email}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-white/5 text-text-muted hover:text-red-400 transition-colors"
                  title={language === "ar" ? "تسجيل الخروج" : "Sign Out"}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent-coral text-white text-xs font-bold shadow-glow hover:opacity-90 transition-opacity"
              >
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Link>
            )}
          </div>
        )}

        <button
          className="mobile-menu-toggle"
          id="mobileMenuToggle"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`hamburger ${mobileMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer show">
          <div className="mobile-nav-links">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`mobile-nav-tab ${isActive(tab.href) ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {tab.label}
              </Link>
            ))}
            {!isPending && !session?.user && (
              <Link
                href="/auth/login"
                className="mobile-nav-tab text-primary font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
