"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/lib/auth-client";
import { Button } from "../ui/button";

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

  return (
    <div className="relative lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border-white/10 bg-white/[0.03] p-2 text-white/60 hover:bg-white/5 hover:text-white"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>

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
                  {initials && (
                    <div
                      onClick={() => setIsUserMenuOpen((open) => !open)}
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-primary/20 text-xs font-bold text-primary"
                    >
                      {initials}
                    </div>
                  )}

                  {isUserMenuOpen && (
                    <div
                      id="user-menu"
                      className="absolute start-0 top-full z-50 w-fit rounded-md border border-[var(--border)] bg-[var(--bg-body)] p-2 shadow-[var(--shadow-card)]"
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t("navLogout")}
                      </Button>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    aria-label="Toggle language"
                    className="text-sm font-semibold text-white/60 hover:text-white"
                  >
                    {language === "ar" ? "English" : "Arabic"}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    aria-label="Toggle language"
                    className="text-sm font-semibold text-white/60 hover:text-white"
                  >
                    {language === "ar" ? "English" : "Arabic"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/auth/login");
                    }}
                    className="text-sm font-semibold text-white/60 hover:text-white"
                  >
                    {language === "ar" ? "تسجيل الدخول" : "Login"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/auth/register");
                    }}
                    className="bg-gradient-to-r from-primary to-primary-dark text-sm font-semibold text-white hover:text-white"
                  >
                    {language === "ar" ? "إنشاء حساب" : "Sign Up"}
                  </Button>
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
