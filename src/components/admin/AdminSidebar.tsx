"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  KeyRound,
  MessageSquareDiff,
  ShieldCheck,
  Bell,
  Sparkles,
  ChevronDown,
  Layers,
  Coins,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { usePermissionContext } from "../../contexts/PermissionContext";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, hasPermission, isSuperAdmin } = usePermissionContext();
  const [activeTab, setActiveTab] = useState<"catalog" | "governance">("catalog");

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      show: true,
      badge: undefined,
    },
    {
      label: "Universities",
      href: "/admin/universities",
      icon: Building2,
      show: hasPermission("universities:edit_global") || hasPermission("universities:edit_scoped"),
      badge: undefined,
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: Users,
      show: hasPermission("users:manage_staff") || hasPermission("users:manage_admins"),
      badge: undefined,
    },
    {
      label: "Dynamic Roles",
      href: "/admin/roles",
      icon: KeyRound,
      show: isSuperAdmin || hasPermission("roles:manage"),
      badge: "RBAC",
    },
    {
      label: "Suggestions Queue",
      href: "/admin/suggestions",
      icon: MessageSquareDiff,
      show: hasPermission("moderation:review"),
      badge: "3",
    },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
      show: true,
      badge: undefined,
    },
    {
      label: "Security Audit",
      href: "/admin/audit-log",
      icon: ShieldCheck,
      show: hasPermission("audit:view"),
      badge: undefined,
    },
  ];

  // Pinned scoped institutions / active governance items
  const pinnedInstitutions = [
    { name: "Cairo University", code: "CU", score: "98.4%", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { name: "Ain Shams University", code: "ASU", score: "94.2%", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { name: "AUC New Cairo", code: "AUC", score: "100%", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  ];

  return (
    <aside className="w-72 flex-shrink-0 bg-[#080A11] border-r border-[#151926] flex flex-col min-h-screen p-5 justify-between select-none">
      <div className="space-y-6">
        {/* Top Brand & Profile Switcher */}
        <div className="flex items-center justify-between pb-2">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 ring-1 ring-white/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">UniGate</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Higher Education OS</p>
            </div>
          </Link>
        </div>

        {/* Segmented Pill Capsule (Stakent Style) */}
        <div className="p-1 rounded-2xl bg-[#111422] border border-[#1C2236] flex items-center gap-1">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "catalog"
                ? "bg-[#1C2238] text-white shadow-md shadow-black/40 border border-[#2F3854]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab("governance")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "governance"
                ? "bg-[#1C2238] text-white shadow-md shadow-black/40 border border-[#2F3854]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Governance
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#151929] text-white shadow-lg shadow-black/50 border border-[#28314A]"
                      : "text-slate-400 hover:bg-[#111422] hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-purple-400" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "bg-[#171B2B] text-slate-400 border border-[#232A3E]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Pinned Scoped Institutions (Stakent "Active Staking" list style) */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Pinned Institutions</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#171B2B] text-slate-300 text-[10px]">
              {pinnedInstitutions.length}
            </span>
          </div>

          <div className="space-y-2">
            {pinnedInstitutions.map((inst) => (
              <div
                key={inst.code}
                className="p-3 rounded-2xl bg-[#0F121E] border border-[#1A2033] hover:border-[#2B3550] transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-[11px] border ${inst.color}`}>
                    {inst.code}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                      {inst.name}
                    </p>
                    <p className="text-[10px] text-slate-400">Quality Health</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-400">{inst.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Glowing Feature Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-[#18152E] to-[#100D22] border border-[#352B5E] shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extrabold text-white">Super Admin Tier</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Platform-level authorization with live PostgreSQL security checks and atomic rollbacks.
        </p>
        <Link
          href="/admin/roles"
          className="block text-center py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold border border-purple-500/40 transition-colors"
        >
          Manage RBAC Matrix
        </Link>
      </div>
    </aside>
  );
}
