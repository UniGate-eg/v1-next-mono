"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Globe, User, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession, signOut } from "@/lib/auth-client";

interface MenubarProps {
  navbarLinks: { href: string; label: string; key: string }[];
  isActive: (href: string) => boolean;
}

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

const Menubar = ({ navbarLinks, isActive }: MenubarProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const { language, toggleLanguage, t } = useLanguage();
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const user = session?.user;
  const initials = getInitials(user?.name) || user?.email?.[0]?.toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="absolute end-0 top-full z-50 mt-2 w-56 rounded-md border border-[var(--border)] bg-[var(--bg-body)] p-2 shadow-[var(--shadow-card)]"
        >
          {navbarLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={`block rounded-sm px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white/5 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {!isPending && (
            <div className="mt-1 flex flex-col gap-2 border-t border-white/10 px-1 pt-3">
              {user ? (
                <div className="flex items-center gap-2 px-1 justify-between">
                  <button
                    type="button"
                    aria-label={
                      isUserMenuOpen ? "Close user menu" : "Open user menu"
                    }
                    aria-expanded={isUserMenuOpen}
                    aria-controls="user-menu"
                    aria-haspopup="true"
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-primary/20 p-0 text-xs font-bold text-sky-300 cursor-pointer"
                  >
                    {initials ? initials : <User className="h-4 w-4 text-sky-300" aria-hidden="true" />}
                  </button>

                  {isUserMenuOpen && (
                    <div
                      id="user-menu"
                      className="absolute start-0 top-full z-50 mt-1 w-44 rounded-md border border-[var(--border)] bg-[var(--bg-body)] p-2 shadow-[var(--shadow-card)]"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-start text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors mb-1"
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

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleLanguage();
                    }}
                    title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
                    aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
                    className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none"
                  >
                    <Globe className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                    <span>{language === "ar" ? "English" : "عربي"}</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleLanguage();
                    }}
                    title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
                    aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none"
                  >
                    <Globe className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                    <span>{language === "ar" ? "English" : "عربي"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/auth/login");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none"
                  >
                    <User className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                    <span>{language === "ar" ? "تسجيل الدخول" : "Login"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/auth/register");
                    }}
                    className="rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-all cursor-pointer select-none"
                  >
                    {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                  </button>
                </>
              )}
            </div>
          )}
        </nav>
      )}
    </div>
  );
};

export default Menubar;
