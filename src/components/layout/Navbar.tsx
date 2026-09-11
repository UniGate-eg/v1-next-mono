"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession, signOut } from "@/lib/auth-client";
import { Globe, User, LogOut } from "lucide-react";
import Menubar from "./Menubar";

function getInitials(name?: string | null) {
  if (!name?.trim()) return "";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  // Do not render public Navbar inside the Admin Portal or auth pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) {
    return null;
  }

  const NavbarLinks: { href: string; label: string; key: string }[] = [
    { href: "/", label: t("navHome"), key: "home" },
    { href: "/about", label: t("navAbout"), key: "about" },
    { href: "/universities", label: t("navUniversities"), key: "universities" },
    { href: "/compare", label: t("navCompare"), key: "compare" },
    { href: "/majors", label: t("navMajors"), key: "majors" },
    { href: "/dashboard", label: t("navDashboard"), key: "dashboard" },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
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
    <>
      {/* Desktop Navbar  */}
      <nav className="hidden items-center gap-3 lg:flex" id="navTabs">
        {NavbarLinks.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`text-sm font-semibold cursor-pointer ${active ? " decoration-primary text-white" : "text-white/60 hover:text-white"} px-4 py-1.5 `}
              data-page={tab.key}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Actions  */}
      <div className="hidden items-center justify-center gap-3 sm:gap-4 lg:flex relative z-20">
        {/* Language Switcher with Globe Icon (Always Visible) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleLanguage();
          }}
          title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 hover:border-sky-400/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none active:scale-95"
        >
          <Globe className="h-3.5 w-3.5 text-sky-400 shrink-0" aria-hidden="true" />
          <span>{language === "ar" ? "English" : "عربي"}</span>
        </button>

        {!isPending && session?.user ? (
          <div className="relative">
            <button
              type="button"
              aria-label="Open user menu"
              aria-expanded={isUserMenuOpen}
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-primary/20 hover:bg-primary/30 text-white cursor-pointer transition-all"
            >
              {getInitials(session.user.name) ? (
                <span className="text-xs font-bold text-sky-300">
                  {getInitials(session.user.name)}
                </span>
              ) : (
                <User className="h-4 w-4 text-sky-300" aria-hidden="true" />
              )}
            </button>

            {/* User Menu  */}
            {isUserMenuOpen && (
              <div
                id="user-menu"
                className="absolute end-0 top-full z-50 mt-2 w-48 rounded-lg border border-white/15 bg-[#18110b] p-2 shadow-2xl backdrop-blur-md"
              >
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-[11px] text-white/60 truncate">{session.user.email}</p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-start text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-sky-400" />
                  <span>{t("navDashboard")}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-start text-xs font-medium text-red-300 hover:text-white hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t("navLogout")}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {!isPending && (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all cursor-pointer select-none"
                >
                  <User className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                  <span>{language === "ar" ? "تسجيل الدخول" : "Login"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/auth/register")}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 bg-gradient-to-r from-sky-500 to-indigo-600 transition-all cursor-pointer select-none active:scale-95"
                >
                  {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile Menu  */}

      <Menubar navbarLinks={NavbarLinks} isActive={isActive} />
    </>
  );
}
