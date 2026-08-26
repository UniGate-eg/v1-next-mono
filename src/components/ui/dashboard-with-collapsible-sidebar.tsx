"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  DollarSign,
  Monitor,
  ShoppingCart,
  Tag,
  BarChart3,
  Users,
  ChevronDown,
  ChevronsRight,
  Settings,
  HelpCircle,
  Building2,
  GraduationCap,
  Inbox,
  Bell,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// ==========================================
// ICON REGISTRY (Resolves string icon identifiers safely)
// ==========================================
const ICON_MAP: Record<string, LucideIcon | React.ComponentType<{ className?: string }>> = {
  home: Home,
  dollarsign: DollarSign,
  monitor: Monitor,
  shoppingcart: ShoppingCart,
  tag: Tag,
  barchart3: BarChart3,
  users: Users,
  settings: Settings,
  helpcircle: HelpCircle,
  building2: Building2,
  graduationcap: GraduationCap,
  inbox: Inbox,
  bell: Bell,
  shieldcheck: ShieldCheck,
};

function resolveIcon(
  icon: string | LucideIcon | React.ComponentType<{ className?: string }> | undefined,
  defaultIcon: LucideIcon
): LucideIcon | React.ComponentType<{ className?: string }> {
  if (!icon) return defaultIcon;
  if (typeof icon === "string") {
    return ICON_MAP[icon.toLowerCase()] || defaultIcon;
  }
  return icon;
}

// ==========================================
// DATA CONTRACTS (SEPARATION OF DATA & DESIGN)
// ==========================================

export interface NavItem {
  icon?: string | LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  href?: string;
  notifs?: number;
}

export interface UserProfile {
  name: string;
  plan: string;
}

export interface SidebarData {
  user?: UserProfile;
  navItems?: NavItem[];
  accountNavItems?: NavItem[];
}

export const defaultSidebarData: SidebarData = {
  user: {
    name: "TomIsLoading",
    plan: "Pro Plan",
  },
  navItems: [
    { icon: "home", title: "Dashboard", href: "/admin" },
    { icon: "dollarsign", title: "Sales", notifs: 3 },
    { icon: "monitor", title: "View Site" },
    { icon: "shoppingcart", title: "Products" },
    { icon: "tag", title: "Tags" },
    { icon: "barchart3", title: "Analytics" },
    { icon: "users", title: "Members", notifs: 12 },
  ],
  accountNavItems: [
    { icon: "settings", title: "Settings", href: "/admin/roles" },
    { icon: "helpcircle", title: "Help & Support", href: "/admin/audit-log" },
  ],
};

// ==========================================
// ROOT WRAPPER COMPONENT
// ==========================================

export interface DashboardWithCollapsibleSidebarProps {
  data?: SidebarData;
  children?: React.ReactNode;
}

export const Example = ({ data = defaultSidebarData, children }: DashboardWithCollapsibleSidebarProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? "dark" : ""}`}>
      <div className="flex w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Sidebar data={data} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// COLLAPSIBLE SIDEBAR
// ==========================================

export const Sidebar = ({ data = defaultSidebarData }: { data?: SidebarData }) => {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const [selected, setSelected] = useState(data.navItems?.[0]?.title || "Dashboard");

  const navItems = data.navItems || defaultSidebarData.navItems!;
  const accountNavItems = data.accountNavItems || defaultSidebarData.accountNavItems!;
  const userInfo = data.user || defaultSidebarData.user!;

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? "w-64 p-2" : "w-[52px] p-1.5"
      } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm relative flex flex-col justify-between select-none z-30`}
    >
      <div>
        <TitleSection open={open} user={userInfo} />

        <div className="space-y-1 mb-8">
          {navItems.map((item) => {
            const isSelected = item.href
              ? pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              : selected === item.title;

            return (
              <Option
                key={item.title}
                Icon={resolveIcon(item.icon, Home)}
                title={item.title}
                href={item.href}
                selected={isSelected}
                setSelected={() => setSelected(item.title)}
                open={open}
                notifs={item.notifs}
              />
            );
          })}
        </div>

        {open && accountNavItems.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Account
            </div>
            {accountNavItems.map((item) => (
              <Option
                key={item.title}
                Icon={resolveIcon(item.icon, Settings)}
                title={item.title}
                href={item.href}
                selected={item.href ? pathname.startsWith(item.href) : false}
                setSelected={() => setSelected(item.title)}
                open={open}
                notifs={item.notifs}
              />
            ))}
          </div>
        )}
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

interface OptionProps {
  Icon: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  href?: string;
  selected: boolean;
  setSelected: () => void;
  open: boolean;
  notifs?: number;
}

const Option = ({ Icon, title, href, selected, setSelected, open, notifs }: OptionProps) => {
  const content = (
    <div
      onClick={setSelected}
      className={`relative flex ${open ? "h-11 px-2" : "h-10 px-0"} w-full items-center ${
        open ? "justify-start" : "justify-center"
      } rounded-lg transition-all duration-200 cursor-pointer ${
        selected
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
      title={!open ? title : undefined}
    >
      <div className={`grid h-full ${open ? "w-10" : "w-full"} place-content-center shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>

      {open && (
        <span
          className={`text-sm font-medium transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {title}
        </span>
      )}

      {notifs !== undefined && notifs > 0 && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    );
  }

  return content;
};

const TitleSection = ({ open, user }: { open: boolean; user: UserProfile }) => {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-800 ${open ? "mb-6 pb-4" : "mb-4 pb-3"}`}>
      <div
        className={`flex cursor-pointer items-center ${
          open ? "justify-between p-2" : "justify-center p-0"
        } rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-800`}
      >
        <div className={`flex items-center ${open ? "gap-3" : "justify-center w-full"}`}>
          <Logo open={open} />
          {open && (
            <div
              className={`transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {user.plan}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
};

const Logo = ({ open = true }: { open?: boolean }) => {
  return (
    <div
      className={`grid ${
        open ? "size-10" : "size-8"
      } shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm transition-all`}
    >
      <svg
        width={open ? "20" : "16"}
        height="auto"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
      >
        <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
        <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
      </svg>
    </div>
  );
};

const ToggleClose = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
      aria-label="Toggle Sidebar"
    >
      <div className={`flex items-center ${open ? "p-3" : "py-2.5 justify-center"}`}>
        <div className="grid size-7 place-content-center shrink-0">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-sm font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};

export default Example;
