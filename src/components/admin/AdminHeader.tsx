"use client";

import { LogOut, UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationBell } from "./NotificationBell";
import { usePermissionContext } from "../../contexts/PermissionContext";

export function AdminHeader() {
  const { user, isSuperAdmin, isAdmin } = usePermissionContext();

  const getRoleBadge = () => {
    if (isSuperAdmin) return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">Super Admin</span>;
    if (isAdmin) return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-sky-100 text-sky-800 border border-sky-200">Admin</span>;
    if (user?.roles.some(r => r.key === "CONTENT_EDITOR")) return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">Content Editor</span>;
    if (user?.roles.some(r => r.key === "UNIVERSITY_REP")) return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-200">University Rep</span>;
    if (user?.roles.some(r => r.key === "COMMUNITY_MODERATOR")) return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-violet-100 text-violet-800 border border-violet-200">Moderator</span>;
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-800">Staff</span>;
  };

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-slate-800 tracking-tight text-lg">UniGate Operations</h1>
        {getRoleBadge()}
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-900">{user?.name || "Admin User"}</span>
            <span className="text-[10px] text-slate-500">{user?.email}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.location.href = "/";
          }}
          className="text-xs text-slate-700 hover:text-red-600 hover:bg-red-50 border-slate-200"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Exit CMS
        </Button>
      </div>
    </header>
  );
}
