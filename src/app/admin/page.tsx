import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getUserPermissionsCached } from "../../server/services/RbacService";
import { adminCatalogService } from "../../lib/di";
import Link from "next/link";
import {
  Building2,
  BookOpen,
  AlertCircle,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userContext = await getUserPermissionsCached(prisma, session!.user.id);
  const kpis = await adminCatalogService.getDashboardKPIs(userContext!);

  const isScoped = userContext?.assignedUniversityIds !== "GLOBAL";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {userContext?.name} <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isScoped
              ? `Operational view scoped to ${Array.isArray(userContext?.assignedUniversityIds) ? userContext?.assignedUniversityIds.length : 0} assigned institution(s).`
              : "Global administrator portal — Live monitoring across all Egyptian universities."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/universities"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Building2 className="w-4 h-4" /> Manage Universities
          </Link>
          {userContext?.permissions.has("moderation:review") && (
            <Link
              href="/admin/suggestions"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <AlertCircle className="w-4 h-4" /> Suggestions ({kpis.pendingSuggestions})
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Universities</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{kpis.totalUniversities}</div>
            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
              <span className="text-emerald-600 font-semibold">{kpis.publishedUniversities} Live</span>
              <span>•</span>
              <span className="text-amber-600">{kpis.draftUniversities} Drafts</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Degree Programs</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{kpis.totalPrograms}</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full tuition coverage</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Suggestions</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{kpis.pendingSuggestions}</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Awaiting moderator review</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Staff</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{kpis.totalStaff}</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <span>Governed by dynamic RBAC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Action Tiles */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
          <div className="space-y-3">
            {userContext?.permissions.has("universities:create_delete") && (
              <Link
                href="/admin/universities/new"
                className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Add New University</h4>
                    <p className="text-[11px] text-slate-500">Create bilingual profile</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {userContext?.permissions.has("users:manage_staff") && (
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">User Promotion & Scope</h4>
                    <p className="text-[11px] text-slate-500">Assign roles and institutions</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}

            {userContext?.permissions.has("roles:manage") && (
              <Link
                href="/admin/roles"
                className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Dynamic Role Engine</h4>
                    <p className="text-[11px] text-slate-500">Configure permission matrix</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Audit Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live System Audit Trail</h3>
            <Link href="/admin/audit-log" className="text-xs font-semibold text-blue-600 hover:underline">
              View full audit log &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {kpis.recentAuditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No recent audit activity recorded</div>
            ) : (
              kpis.recentAuditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      log.action === "ROLLBACK"
                        ? "bg-red-100 text-red-700"
                        : log.action === "CREATE"
                        ? "bg-emerald-100 text-emerald-700"
                        : log.action === "UPDATE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {log.action}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-900 truncate">
                        {log.entityType} {log.university?.nameEn ? `(${log.university.nameEn})` : ""}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        By {log.actorEmail || log.actorId} • {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/admin/audit-log"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
