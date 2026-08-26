"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  KeyRound,
  AlertCircle,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
} from "lucide-react";
import { usePermissionContext } from "../../contexts/PermissionContext";

export function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission, isSuperAdmin } = usePermissionContext();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: "Universities",
      href: "/admin/universities",
      icon: Building2,
      show: hasPermission("universities:edit_global") || hasPermission("universities:edit_scoped"),
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: Users,
      show: hasPermission("users:manage_staff") || hasPermission("users:manage_admins"),
    },
    {
      label: "Dynamic Roles",
      href: "/admin/roles",
      icon: KeyRound,
      show: isSuperAdmin || hasPermission("roles:manage"),
    },
    {
      label: "Suggestions Queue",
      href: "/admin/suggestions",
      icon: AlertCircle,
      show: hasPermission("moderation:review"),
    },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
      show: true,
    },
    {
      label: "Audit Logs",
      href: "/admin/audit-log",
      icon: ShieldCheck,
      show: hasPermission("audit:view"),
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
        <Link href="/admin" className="text-base font-bold text-white flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span>UniGate Admin</span>
        </Link>
      </div>

      <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Administration
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>UniGate RBAC Engine</span>
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">v1.2</span>
      </div>
    </aside>
  );
}
