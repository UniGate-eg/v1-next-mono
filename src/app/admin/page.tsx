import { adminCatalogService } from "../../lib/di";
import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getUserPermissionsCached } from "../../server/services/RbacService";
import {
  Building2,
  GraduationCap,
  Users,
  MessageSquareDiff,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userCtx = session?.user?.id ? await getUserPermissionsCached(prisma, session.user.id) : null;
  const kpis = await adminCatalogService.getDashboardKPIs(userCtx || undefined);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Premium Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#0B0F17] via-[#1E1B4B] to-[#0F172A] p-8 sm:p-10 text-white shadow-2xl border border-slate-800/80">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unified Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {userCtx?.name || "Administrator"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time directory catalog governance, dynamic role matrix authorization, and immutable change tracking for Egyptian Higher Education.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {userCtx?.permissions.has("universities:create_delete") && (
              <Link
                href="/admin/universities/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-102"
              >
                <Building2 className="w-4 h-4" /> Add Institution
              </Link>
            )}
            <Link
              href="/admin/audit-log"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold backdrop-blur-xs border border-white/15 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Security Audit
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Universities */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Universities</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.totalUniversities}</h3>
          <p className="text-[11px] text-slate-400 mt-2">{kpis.publishedUniversities} published &bull; {kpis.draftUniversities} draft</p>
        </div>

        {/* Metric 2: Academic Programs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Cataloged
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Degree Programs</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.totalPrograms}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Undergraduate and graduate majors</p>
        </div>

        {/* Metric 3: Pending Suggestions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquareDiff className="w-5 h-5" />
            </div>
            {kpis.pendingSuggestions > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                Action Req.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Clear
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Community Suggestions</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.pendingSuggestions}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Pending moderation queue</p>
        </div>

        {/* Metric 4: Active Staff */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Active
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff & Reps</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.totalStaff}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Provisioned governance accounts</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Operational Domains</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/admin/universities"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Manage Academic Catalog
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Update profiles, faculties, degree tuitions, accreditation data, and monitor quality scores.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              Staff & Scope Governance
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Promote staff, bind institutional scopes, adjust privilege tiers, and manage account statuses.
            </p>
          </Link>

          <Link
            href="/admin/roles"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <KeyRound className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Dynamic Role Matrix
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Configure fine-grained system capabilities and create custom roles with instantaneous authorization.
            </p>
          </Link>
        </div>
      </div>

      {/* Live System Audit Trail Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live System Activity</h3>
            <p className="text-xs text-slate-500">Immutable ledger of administrative mutations and state modifications.</p>
          </div>
          <Link href="/admin/audit-log" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
            View full ledger &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {kpis.recentAuditLogs.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No activity records logged in the system yet.
              </div>
            ) : (
              kpis.recentAuditLogs.map((log: any) => (
                <div key={log.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        log.action === "ROLLBACK"
                          ? "bg-rose-50 text-rose-600"
                          : log.action === "CREATE"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {log.actorEmail || log.actorId}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
                            log.action === "ROLLBACK"
                              ? "bg-rose-100 text-rose-700"
                              : log.action === "CREATE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {log.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Targeted <span className="font-semibold text-slate-700">{log.entityType}</span> ({log.entityId})
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {format(new Date(log.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
