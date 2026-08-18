import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";
import { Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — UniGate Egypt",
  description: "Access your personalized Egyptian university admissions dashboard and saved programs.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-16 sm:py-24 overflow-hidden bg-[#0A0B1E]">
      {/* ── Apple-Grade Ambient Glowing Canvas ─────────────────────────────── */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-pink-600/10 rounded-full blur-[180px] pointer-events-none" />

      {/* ── Top Header Brand ──────────────────────────────────────────────── */}
      <div className="relative text-center space-y-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
            <Compass className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Uni<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Gate</span>
          </span>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign In with UniGate ID
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Manage your admissions roadmap, compare universities, and track deadlines
          </p>
        </div>
      </div>

      {/* ── Centered Spacious Card ────────────────────────────────────────── */}
      <div className="relative w-full max-w-[460px] z-10">
        <div className="relative rounded-3xl border border-purple-500/20 bg-[#131534]/75 p-7 sm:p-9 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl">
          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1 mb-7 rounded-xl bg-slate-900/90 border border-white/5 text-xs font-semibold">
            <button
              type="button"
              className="py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm text-center font-medium"
            >
              Sign In
            </button>
            <Link
              href="/auth/register"
              className="py-2.5 rounded-lg text-slate-400 hover:text-white transition-colors text-center font-medium"
            >
              Create Account
            </Link>
          </div>

          <Suspense fallback={<div className="h-72 bg-slate-800/40 animate-pulse rounded-2xl" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* ── Bottom Security & Privacy Footer ───────────────────────────────── */}
      <div className="relative mt-8 text-center space-y-2 z-10">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>256-Bit Encrypted Secure Session · NAQAAE Verified Higher Ed Data</span>
        </div>
        <p className="text-[11px] text-slate-600">
          © 2026 UniGate Egypt. Built for students navigating higher education in Egypt.
        </p>
      </div>
    </div>
  );
}
