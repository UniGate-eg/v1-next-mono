"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  KeyRound,
  MessageSquareDiff,
  ShieldAlert,
  Bell,
  Sparkles,
  ExternalLink,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { usePermissionContext } from "../../contexts/PermissionContext";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, hasPermission, isSuperAdmin } = usePermissionContext();

  const navItems = [
    {
      group: "Core Operations",
      items: [
        {
          label: "Dashboard Overview",
          href: "/admin",
          icon: LayoutDashboard,
          show: true,
          badge: undefined,
        },
        {
          label: "University Catalog",
          href: "/admin/universities",
          icon: Building2,
          show: hasPermission("universities:edit_global") || hasPermission("universities:edit_scoped"),
          badge: undefined,
        },
        {
          label: "Suggestions Queue",
          href: "/admin/suggestions",
          icon: MessageSquareDiff,
          show: hasPermission("moderation:review"),
          badge: "Review",
        },
      ],
    },
    {
      group: "Access & Governance",
      items: [
        {
          label: "User Governance",
          href: "/admin/users",
          icon: Users,
          show: hasPermission("users:manage_staff") || hasPermission("users:manage_admins"),
          badge: undefined,
        },
        {
          label: "Role & Permission Matrix",
          href: "/admin/roles",
          icon: KeyRound,
          show: isSuperAdmin || hasPermission("roles:manage"),
          badge: "RBAC",
        },
        {
          label: "Security Audit Log",
          href: "/admin/audit-log",
          icon: ShieldAlert,
          show: hasPermission("audit:view"),
          badge: undefined,
        },
      ],
    },
    {
      group: "Platform",
      items: [
        {
          label: "Notification Center",
          href: "/admin/notifications",
          icon: Bell,
          show: true,
          badge: undefined,
        },
      ],
    },
  ];

  return (
    <aside className="w-68 flex-shrink-0 bg-[#0B0F17] text-slate-300 flex flex-col min-h-screen border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-18 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/60 justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">UniGate</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Operations & Governance</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {navItems.map((group) => {
          const visibleItems = group.items.filter((item) => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.group}
              </div>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && !isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                          {item.badge}
                        </span>
                      )}

                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2) : "AD"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.name || "Staff Member"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.roles?.[0]?.name || "Authenticated"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/"
            title="Switch to Public Directory"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
