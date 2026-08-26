"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { usePermissionContext } from "../../contexts/PermissionContext";
import {
  ShieldCheck,
  Building,
  ChevronRight,
  Sparkles,
  Command,
} from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();
  const { user, isSuperAdmin } = usePermissionContext();

  const getBreadcrumbTitle = (path: string) => {
    if (path === "/admin") return "Overview";
    if (path.startsWith("/admin/universities")) return "Universities";
    if (path.startsWith("/admin/users")) return "User Management";
    if (path.startsWith("/admin/roles")) return "Roles & Permissions";
    if (path.startsWith("/admin/suggestions")) return "Suggestion Moderation";
    if (path.startsWith("/admin/notifications")) return "Notifications";
    if (path.startsWith("/admin/audit-log")) return "Audit Log";
    return "Console";
  };

  return (
    <header className="h-18 sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between transition-all">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2.5 text-xs text-slate-500">
        <Link href="/admin" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
          Admin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
          {getBreadcrumbTitle(pathname)}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Role Badge */}
        {user?.roles?.[0] && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{user.roles[0].name}</span>
            {user.assignedUniversityIds !== "GLOBAL" && (
              <span className="text-[10px] text-slate-500 font-mono">
                ({Array.isArray(user.assignedUniversityIds) ? user.assignedUniversityIds.length : 0} scoped)
              </span>
            )}
          </div>
        )}

        {/* In-App Notifications Drawer */}
        <NotificationBell />

        {/* User Monogram */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-slate-100">
          {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
        </div>
      </div>
    </header>
  );
}
