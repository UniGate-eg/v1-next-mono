"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession, signOut } from "@/lib/auth-client";
import Image from "next/image";
import { Button } from "../ui/button";
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

  // Do not render public Navbar inside the Admin Portal
  if (pathname?.startsWith("/admin")) {
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

      <div className="hidden items-center justify-center gap-3 sm:gap-4 lg:flex">
        {!isPending && session?.user ? (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="default"
              aria-label="Open user menu"
              aria-expanded={isUserMenuOpen}
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full"
            >
              {getInitials(session.user.name) ||
                session.user.email?.[0]?.toUpperCase()}
            </Button>

            {/* User Menu  */}

            {isUserMenuOpen && (
              <div
                id="user-menu"
                className="absolute end-0 top-full z-50 mt-2 w-44 rounded-md border border-[var(--border)] bg-[var(--bg-body)] p-2 shadow-[var(--shadow-card)]"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    toggleLanguage();
                    setIsUserMenuOpen(false);
                  }}
                  className="block w-full rounded-sm px-3 py-2 text-start text-sm font-medium text-white"
                >
                  {language === "ar" ? "English" : "Arabic"}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full rounded-sm px-3 py-2 text-start text-sm font-medium text-white"
                >
                  {t("navLogout")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {!isPending && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="text-sm font-semibold text-white/60 hover:text-white"
                >
                  {language === "ar" ? "English" : "Arabic"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/auth/login")}
                  className="text-sm font-semibold text-white/60 hover:text-white"
                >
                  {language === "ar" ? "تسجيل الدخول" : "Login"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => router.push("/auth/register")}
                  className="text-sm font-semibold text-white hover:text-white"
                >
                  {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                </Button>
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
