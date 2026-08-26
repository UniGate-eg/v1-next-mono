"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { usePermissionContext } from "../../contexts/PermissionContext";
import {
  Search,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Command,
  Settings,
} from "lucide-react";

export function AdminHeader() {
  const pathname = usePathname();
  const { user, isSuperAdmin } = usePermissionContext();

  return (
    <header className="h-20 bg-[#07080D]/90 backdrop-blur-xl border-b border-[#151926] px-6 sm:px-10 lg:px-12 flex items-center justify-between sticky top-0 z-40">
      {/* Left User Identity Dropdown & Primary Action */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* User Pill Capsule */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#111422] border border-[#1D2336] hover:border-[#2D3650] transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-purple-500/30">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white group-hover:text-purple-300 transition-colors">
                {user?.name || "System Admin"}
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {user?.roles?.[0]?.key || "SUPER_ADMIN"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {user?.email || "admin@unigate.eg"}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-1" />
        </div>

        {/* Primary Action Button (Lavender / Lilac Stakent Style) */}
        <Link
          href="/admin/universities/new"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C4B5FD] hover:bg-[#DDD6FE] text-[#0A0B14] font-extrabold text-xs shadow-lg shadow-purple-500/20 transition-all hover:scale-102 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Institution</span>
        </Link>
      </div>

      {/* Right Controls: Search Capsule, Notification Bell, Settings */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar Capsule */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#111422] border border-[#1D2336] text-xs text-slate-400 w-64 focus-within:border-purple-500/60 focus-within:w-72 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search catalog, users..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500 w-full"
          />
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#1B2033] text-[10px] text-slate-400 font-mono font-bold">
            <Command className="w-2.5 h-2.5" /> K
          </div>
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Settings Icon */}
        <Link
          href="/admin/roles"
          className="p-2.5 rounded-2xl bg-[#111422] border border-[#1D2336] hover:border-purple-500/40 text-slate-400 hover:text-white transition-colors"
          title="Settings & Role Configuration"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
