import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";
import { Compass, Sparkles, ShieldCheck, CheckCircle2, Award, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — UniGate Egypt",
  description: "Access your personalized Egyptian university admissions dashboard and saved programs.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12 overflow-hidden bg-[#0A0B1E]">
      {/* ── Apple-Grade Ambient Glowing Orbs ──────────────────────────────── */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* ── Left Showcase Pane (Desktop Only) ────────────────────────────── */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-6">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-purple-500/30 backdrop-blur-md text-xs font-semibold text-purple-200 hover:border-purple-400/50 transition-all group"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-sm">
                <Compass className="w-3 h-3 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <span>UniGate Egypt Higher Education</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.2]">
              Your Gateway to Egyptian Universities & Admissions.
            </h1>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              Compare accredited faculties, calculate living & tuition expenses, and track your college application pipeline with real-time accuracy.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">30+ Verified Egyptian Universities</h4>
                <p className="text-[11px] text-slate-400">Public, Private, National, & International models mapped</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Direct Side-by-Side Comparison</h4>
                <p className="text-[11px] text-slate-400">Evaluate NAQAAE & ABET accreditations with tuition breakdown</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Admissions Kanban Tracker</h4>
                <p className="text-[11px] text-slate-400">Save dream majors and manage submission deadlines in one place</p>
              </div>
            </div>
          </div>

          {/* Student Community Pulse */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0A0B1E] bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">CU</div>
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0A0B1E] bg-pink-600 flex items-center justify-center text-[10px] font-bold text-white">AUC</div>
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0A0B1E] bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">GUC</div>
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0A0B1E] bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white">NU</div>
            </div>
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-purple-300">14,200+ students</span> exploring 2026/2027 admissions
            </div>
          </div>
        </div>

        {/* ── Right Authentication Card ────────────────────────────────────── */}
        <div className="lg:col-span-6 w-full">
          <div className="relative rounded-3xl border border-purple-500/20 bg-[#131534]/70 p-6 sm:p-8 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl">
            {/* Header / Brand */}
            <div className="text-center space-y-2 mb-6">
              <Link href="/" className="inline-flex items-center gap-2 group mb-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform duration-300">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Uni<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Gate</span>
                </span>
              </Link>
              <h2 className="text-xl font-bold text-white">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400">
                Sign in to your student admission tracking dashboard
              </p>
            </div>

            {/* Pill Tab Switcher */}
            <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-slate-900/90 border border-white/5 text-xs font-semibold">
              <button
                type="button"
                className="py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm text-center"
              >
                Sign In
              </button>
              <Link
                href="/auth/register"
                className="py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-center"
              >
                Create Account
              </Link>
            </div>

            <Suspense fallback={<div className="h-64 bg-slate-800/40 animate-pulse rounded-2xl" />}>
              <LoginForm />
            </Suspense>

            {/* Apple-style Security Badge */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>256-Bit Encrypted Secure Student Session · NAQAAE Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
