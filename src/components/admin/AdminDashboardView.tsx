"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Inbox,
  Users,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  Plus,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export interface DashboardKPIs {
  totalUniversities: number;
  publishedUniversities: number;
  draftUniversities: number;
  totalPrograms: number;
  pendingSuggestions: number;
  totalStaff: number;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    actorEmail?: string | null;
    actorId?: string;
    createdAt: string;
    universityName?: string;
  }>;
  topInstitutions: Array<{
    id: string;
    name: string;
    nameAr?: string;
    code: string;
    programsCount: number;
    status: string;
    type: string;
  }>;
  user: {
    name: string;
    role: string;
  };
}

export function AdminDashboardView({ data }: { data: DashboardKPIs }) {
  const [filterPeriod, setFilterPeriod] = useState<"today" | "week" | "all">("week");

  const publishedPercentage =
    data.totalUniversities > 0
      ? Math.round((data.publishedUniversities / data.totalUniversities) * 100)
      : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* ── Top Header & Greeting ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Telemetry
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              UniGate Core v1.4
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Operations & Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time catalog monitoring, RBAC security matrix, and moderation queue.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/universities/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>New University</span>
          </Link>
          <Link
            href="/admin/audit-log"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:scale-[0.98] text-slate-700 dark:text-slate-200 font-medium text-xs sm:text-sm transition-all duration-200 shadow-sm"
          >
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Primary Metric KPI Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Universities */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between min-h-[160px] gap-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              <span>{publishedPercentage}% Active</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Universities
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {data.totalUniversities}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{data.publishedUniversities} published</span>{" "}
              • {data.draftUniversities} drafts
            </p>
          </div>
        </div>

        {/* Metric 2: Degree Programs */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between min-h-[160px] gap-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" />
              <span>Indexed</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Degree Programs
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {data.totalPrograms.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Across verified higher faculties
            </p>
          </div>
        </div>

        {/* Metric 3: Moderation Queue */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between min-h-[160px] gap-y-4">
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-xl border ${
              data.pendingSuggestions > 0
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }`}>
              <Inbox className="h-5 w-5" />
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              data.pendingSuggestions > 0
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            }`}>
              {data.pendingSuggestions > 0 ? (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span>Requires Action</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Queue Clear</span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Suggestions
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {data.pendingSuggestions}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Student & community catalog revisions
            </p>
          </div>
        </div>

        {/* Metric 4: Active Staff & RBAC */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between min-h-[160px] gap-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              <span>RBAC Enforced</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Operators
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {data.totalStaff}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Role permissions & audit logging active
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Workspace 2-Column Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Column: Recent Operations & Catalog Index */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Audit Ledger */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Recent Audit Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Immutable record of administrative state mutations
                </p>
              </div>
              <Link
                href="/admin/audit-log"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>View Full Log</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {data.recentAuditLogs.length > 0 ? (
                data.recentAuditLogs.map((log) => {
                  const isCreate = log.action.includes("CREATE");
                  const isRollback = log.action.includes("ROLLBACK");
                  const isUpdate = log.action.includes("UPDATE");

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div
                          className={`p-2 rounded-lg border shrink-0 ${
                            isRollback
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : isCreate
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          }`}
                        >
                          <Activity className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {log.actorEmail || log.actorId}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                isRollback
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                  : isCreate
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              }`}
                            >
                              {log.action}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            Target: {log.entityType}{" "}
                            {log.universityName ? `(${log.universityName})` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 ml-3">
                        {log.createdAt}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No recent audit activity recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Institutional Index */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Institutional Catalog Quick Index
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct access to verified higher education entities
                </p>
              </div>
              <Link
                href="/admin/universities"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>Manage Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {data.topInstitutions.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/admin/universities/${inst.id}`}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                      {inst.code}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {inst.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {inst.programsCount} Programs • {inst.type}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Catalog Health & Quick Governance Actions */}
        <div className="space-y-6">
          {/* Catalog Health Matrix */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
              Catalog Health Matrix
            </h3>

            <div className="space-y-4">
              {/* Progress 1: Publication Ratio */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Publication Coverage
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {publishedPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${publishedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Progress 2: Moderation Velocity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Moderation Velocity
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {data.pendingSuggestions === 0 ? "100%" : "Queue Active"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${data.pendingSuggestions === 0 ? 100 : 65}%`,
                    }}
                  />
                </div>
              </div>

              {/* Progress 3: RBAC Security Matrix */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    RBAC Enforcement
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    100%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Governance Shortcuts */}
          <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800 pb-3">
              Governance Shortcuts
            </h3>

            <div className="space-y-2.5">
              <Link
                href="/admin/universities/new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Create University
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Add new verified institutional profile
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  + New
                </span>
              </Link>

              <Link
                href="/admin/roles"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Dynamic Roles (RBAC)
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Configure granular permission matrix
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  Security
                </span>
              </Link>

              <Link
                href="/admin/suggestions"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-amber-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                    <Inbox className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Moderate Suggestions
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      Approve or reject crowd-sourced edits
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {data.pendingSuggestions} Pending
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
