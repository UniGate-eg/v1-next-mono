import { adminCatalogService } from "../../lib/di";
import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { getUserPermissionsCached } from "../../server/services/RbacService";
import {
  Building2,
  Users,
  KeyRound,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ChevronDown,
  SlidersHorizontal,
  ExternalLink,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userCtx = session?.user?.id ? await getUserPermissionsCached(prisma, session.user.id) : null;
  const kpis = await adminCatalogService.getDashboardKPIs(userCtx || undefined);

  return (
    <div className="space-y-12 pb-20">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: TOP ASSETS CARDS (Extremely Spacious Grid)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-8">
        {/* Section Header with Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400">
              <span>Catalog Health Overview</span>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="px-2.5 py-1 rounded-full bg-[#131624] text-slate-300 text-xs font-bold border border-[#1E2438]">
                {kpis.totalUniversities} Institutions Active
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              Top Academic Directory Assets
            </h2>
          </div>

          {/* Filter Pills Capsule */}
          <div className="flex items-center gap-3 text-xs">
            <div className="px-4 py-2 rounded-2xl bg-[#111422] border border-[#1C2236] text-slate-300 font-bold flex items-center gap-2 cursor-pointer hover:border-purple-500/40 transition-colors">
              <span>24H</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#111422] border border-[#1C2236] text-slate-300 font-bold flex items-center gap-2 cursor-pointer hover:border-purple-500/40 transition-colors">
              <span>Egyptian Public</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#111422] border border-[#1C2236] text-slate-300 font-bold flex items-center gap-2 cursor-pointer hover:border-purple-500/40 transition-colors">
              <span>Desc</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* 3 Main Glassmorphism Cards + 1 Featured Spotlight Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Card 1: Cairo University (ETH Style) */}
          <div className="rounded-[32px] bg-[#101320] border border-[#1C2236] p-8 shadow-2xl hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-8 min-h-[300px] group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 flex items-center justify-center font-black text-base shadow-lg shadow-indigo-500/10">
                  CU
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Public Flagship</span>
                  <h4 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                    Cairo University
                  </h4>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#171B2B] text-slate-400 group-hover:text-white group-hover:bg-purple-600 flex items-center justify-center transition-all">
                <ArrowUpRight className="w-4.5 h-4.5" />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completeness Score</p>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-4xl font-black text-white tracking-tight">98.4%</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" /> +6.25%
                </span>
              </div>
            </div>

            {/* Glowing SVG Wave Sparkline */}
            <div className="relative pt-2">
              <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 45 C 40 50, 70 20, 110 35 C 150 50, 170 10, 200 15 L 200 60 L 0 60 Z"
                  fill="url(#purpleGrad)"
                />
                <path
                  d="M 0 45 C 40 50, 70 20, 110 35 C 150 50, 170 10, 200 15"
                  fill="transparent"
                  stroke="#A78BFA"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="15" r="4.5" fill="#A78BFA" className="animate-ping opacity-75" />
                <circle cx="200" cy="15" r="3.5" fill="#FFFFFF" />
              </svg>
              <div className="absolute right-0 bottom-0 text-xs font-mono font-bold text-slate-400">
                28 Faculties &bull; Verified
              </div>
            </div>
          </div>

          {/* Card 2: Ain Shams (BNB Style) */}
          <div className="rounded-[32px] bg-[#101320] border border-[#1C2236] p-8 shadow-2xl hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-8 min-h-[300px] group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800/50 flex items-center justify-center font-black text-base shadow-lg shadow-amber-500/10">
                  ASU
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Public Medical & Eng</span>
                  <h4 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                    Ain Shams Univ.
                  </h4>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#171B2B] text-slate-400 group-hover:text-white group-hover:bg-amber-600 flex items-center justify-center transition-all">
                <ArrowUpRight className="w-4.5 h-4.5" />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completeness Score</p>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-4xl font-black text-white tracking-tight">92.7%</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" /> +5.67%
                </span>
              </div>
            </div>

            {/* Glowing SVG Wave Sparkline */}
            <div className="relative pt-2">
              <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                <defs>
                  <linearGradient id="amberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 35 C 50 40, 80 55, 120 25 C 160 5, 180 30, 200 20 L 200 60 L 0 60 Z"
                  fill="url(#amberGrad)"
                />
                <path
                  d="M 0 35 C 50 40, 80 55, 120 25 C 160 5, 180 30, 200 20"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="20" r="3.5" fill="#F59E0B" />
              </svg>
              <div className="absolute right-0 bottom-0 text-xs font-mono font-bold text-slate-400">
                19 Faculties &bull; Active
              </div>
            </div>
          </div>

          {/* Card 3: American University in Cairo (Matic Style) */}
          <div className="rounded-[32px] bg-[#101320] border border-[#1C2236] p-8 shadow-2xl hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-8 min-h-[300px] group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 text-purple-400 border border-purple-800/50 flex items-center justify-center font-black text-base shadow-lg shadow-purple-500/10">
                  AUC
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">International Model</span>
                  <h4 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                    American Univ Cairo
                  </h4>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#171B2B] text-slate-400 group-hover:text-white group-hover:bg-purple-600 flex items-center justify-center transition-all">
                <ArrowUpRight className="w-4.5 h-4.5" />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completeness Score</p>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-4xl font-black text-white tracking-tight">100%</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                  Perfect Quality
                </span>
              </div>
            </div>

            {/* Glowing SVG Wave Sparkline */}
            <div className="relative pt-2">
              <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                <defs>
                  <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 50 C 40 40, 90 45, 130 15 C 160 5, 180 15, 200 10 L 200 60 L 0 60 Z"
                  fill="url(#pinkGrad)"
                />
                <path
                  d="M 0 50 C 40 40, 90 45, 130 15 C 160 5, 180 15, 200 10"
                  fill="transparent"
                  stroke="#C084FC"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="10" r="3.5" fill="#C084FC" />
              </svg>
              <div className="absolute right-0 bottom-0 text-xs font-mono font-bold text-slate-400">
                USD & EGP Tuition
              </div>
            </div>
          </div>

          {/* Card 4: Glowing Purple Spotlight Banner (Stakent Staking Portfolio Promo) */}
          <div className="rounded-[32px] bg-gradient-to-b from-[#1E1638] via-[#16122C] to-[#0E0C1F] border border-[#3E2E6B] p-8 shadow-2xl flex flex-col justify-between space-y-8 min-h-[300px] relative overflow-hidden ring-1 ring-purple-500/20">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-300 fill-current" />
                  <span className="text-xs font-black text-white">Dynamic RBAC</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-black border border-purple-400/40">
                  ACTIVE
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight leading-snug">
                Hierarchical Authority & Scopes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fine-grained role matrix with live PostgreSQL security checks and immutable rollback history.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/admin/roles"
                className="w-full block text-center py-3 rounded-2xl bg-[#C4B5FD] hover:bg-[#DDD6FE] text-[#0A0B14] text-xs font-black shadow-xl shadow-purple-500/25 transition-all"
              >
                Configure Roles Matrix
              </Link>
              <Link
                href="/admin/audit-log"
                className="w-full block text-center py-3 rounded-2xl bg-[#1D1836] hover:bg-[#28214A] text-slate-200 text-xs font-bold border border-[#3A2F60] transition-colors"
              >
                Inspect Audit Ledger
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: MASSIVE EXPANSIVE ACTIVE OPERATIONS CARD
          (Replicating Stakent "Your active stakings" Hero Card)
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[40px] bg-[#101320] border border-[#1C2236] p-10 sm:p-14 shadow-2xl space-y-12">
        <div className="flex items-center justify-between border-b border-[#1A2033] pb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400">Your Active Governance & Scoped Institutions</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <SlidersHorizontal className="w-5 h-5 hover:text-white cursor-pointer" />
            <ExternalLink className="w-5 h-5 hover:text-white cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Left Hero Metric & Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <span>Last Synchronized &bull; 2 minutes ago</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Stake Cairo University (CU)
              </h3>
              <span className="px-3.5 py-1.5 rounded-2xl bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30">
                Egyptian Public Model
              </span>
              <Link
                href="/admin/universities"
                className="px-4 py-1.5 rounded-2xl bg-[#161B2C] text-slate-300 hover:text-white text-xs font-bold border border-[#242D45] transition-colors"
              >
                View Full Profile &rarr;
              </Link>
            </div>

            <div className="flex flex-wrap items-baseline gap-6 pt-4">
              <span className="text-5xl sm:text-7xl font-black text-white tracking-tight font-mono">
                98.4000
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/universities"
                  className="px-6 py-3.5 rounded-2xl bg-[#C4B5FD] hover:bg-[#DDD6FE] text-[#0A0B14] text-xs font-black shadow-lg shadow-purple-500/20 transition-all hover:scale-102"
                >
                  Recalculate Quality
                </Link>
                <Link
                  href="/admin/audit-log"
                  className="px-6 py-3.5 rounded-2xl bg-[#161B2C] hover:bg-[#20273D] text-slate-200 text-xs font-bold border border-[#252E46] transition-colors"
                >
                  Rollback Version
                </Link>
              </div>
            </div>
          </div>

          {/* Right Review Period Rail Slider */}
          <div className="p-8 rounded-[32px] bg-[#0D0F1A] border border-[#1A2033] space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Quality Inspection Period</span>
              <span className="px-3 py-1 rounded-full bg-[#181D30] text-purple-300 text-xs font-mono font-bold">
                6 Months (Annual)
              </span>
            </div>

            {/* Custom Interactive Rail Visual */}
            <div className="relative py-6">
              <div className="h-2 w-full bg-[#1D2338] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-3/4 rounded-full" />
              </div>
              <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#A78BFA] text-[#0A0B14] shadow-xl shadow-purple-500/50 flex items-center justify-center text-xs font-black ring-4 ring-[#0D0F1A]">
                  4M
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Fresh Inspection</span>
              <span>Needs Annual Review</span>
            </div>
          </div>
        </div>

        {/* Bottom Key Stat Dynamics Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#1A2033]">
          <div className="p-6 rounded-3xl bg-[#0D0F1A] border border-[#181D30] space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Health</p>
            <p className="text-base font-black text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> High Precision
            </p>
            <p className="text-xs text-slate-400">14 Checkpoints Met</p>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl bg-[#0D0F1A] border border-[#181D30] space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accreditation</p>
            <p className="text-base font-black text-white">NAQAAE Certified</p>
            <p className="text-xs text-slate-400">Verified &bull; Standard</p>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl bg-[#0D0F1A] border border-[#181D30] space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Risk Assessment</p>
            <p className="text-base font-black text-emerald-400">0.00% Risk</p>
            <p className="text-xs text-slate-400">Zero orphaned faculties</p>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl bg-[#0D0F1A] border border-[#181D30] space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Majors</p>
            <p className="text-base font-black text-purple-300">148 Programs</p>
            <p className="text-xs text-slate-400">Bilingual descriptions</p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: RECENT AUDIT LEDGER TIMELINE (Spacious Feed)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Cryptographic Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-1">Immutable forward ledger of operational mutations with rollback snapshots.</p>
          </div>
          <Link href="/admin/audit-log" className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
            View full log &rarr;
          </Link>
        </div>

        <div className="rounded-[32px] bg-[#101320] border border-[#1C2236] shadow-2xl overflow-hidden divide-y divide-[#181E30]">
          {kpis.recentAuditLogs.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs">
              No audit records logged yet.
            </div>
          ) : (
            kpis.recentAuditLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-6 flex items-center justify-between gap-6 hover:bg-[#151A2B] transition-colors"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      log.action === "ROLLBACK"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : log.action === "CREATE"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white truncate">
                        {log.actorEmail || log.actorId}
                      </span>
                      <span
                        className={`px-3 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider ${
                          log.action === "ROLLBACK"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : log.action === "CREATE"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-[#181D30] text-slate-300 border border-[#252E46]"
                        }`}
                      >
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Targeted entity <span className="font-bold text-slate-200">{log.entityType}</span> ({log.entityId})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-slate-400 block">
                    {format(new Date(log.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
