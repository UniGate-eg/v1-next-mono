"use client";

import React from "react";
import { Sparkles, Building2, TrendingUp, Compass, CheckCircle2, ShieldCheck, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function AuthShowcase() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const features = isAr
    ? [
        {
          icon: <Building2 className="w-5 h-5 text-purple-400" aria-hidden="true" />,
          title: "أكثر من 45 جامعة مصرية",
          description: "تغطية شاملة ومفصلة للجامعات الحكومية، الخاصة، الأهلية، والدولية في مصر.",
        },
        {
          icon: <TrendingUp className="w-5 h-5 text-pink-400" aria-hidden="true" />,
          title: "تنسيق ومصروفات موثقة رسمياً",
          description: "بيانات معتمدة من وزارة التعليم العالي والمجلس الأعلى للجامعات وهيئة (NAQAAE).",
        },
        {
          icon: <Compass className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
          title: "خارطة طريق مخصصة للقبول",
          description: "تتبع مواعيد التقديم، وحساب معادلات الشهادات، وحفظ الكليات المفضلة لديك.",
        },
      ]
    : [
        {
          icon: <Building2 className="w-5 h-5 text-purple-400" aria-hidden="true" />,
          title: "45+ Egyptian Universities",
          description: "Comprehensive profiles across Public, Private, National, and International institutions.",
        },
        {
          icon: <TrendingUp className="w-5 h-5 text-pink-400" aria-hidden="true" />,
          title: "Verified Cutoffs & Tuition Fees",
          description: "Accurate admissions cutoffs and audited fees directly from official university councils.",
        },
        {
          icon: <Compass className="w-5 h-5 text-cyan-400" aria-hidden="true" />,
          title: "Personalized Admission Roadmap",
          description: "Track application deadlines, calculate certificate equivalencies, and bookmark programs.",
        },
      ];

  return (
    <div className="flex flex-col justify-between h-full space-y-8 pr-0 lg:pr-6 py-4">
      {/* ── Top Hero Badge & Heading ────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span>
            {isAr
              ? "بيانات قبول 2026 الرسمية · معتمدة ومحدثة"
              : "Official 2026 Admissions · NAQAAE Verified"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
          {isAr ? (
            <>
              بوابتك الموثوقة لاختيار{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                جامعتك في مصر.
              </span>
            </>
          ) : (
            <>
              Your Definitive Gateway to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
                Higher Education.
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-300/90 max-w-xl leading-relaxed">
          {isAr
            ? "قارن بين الجامعات والتخصصات، واكتشف المصروفات والحدود الدنيا الحقيقية، وخطط لمستقبلك الأكاديمي بكل ثقة ووضوح."
            : "Explore universities, compare faculties and tuition fees, track application cutoffs, and manage your admissions roadmap in one unified platform."}
        </p>
      </div>

      {/* ── Feature Highlights Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 my-2">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
              {feat.icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Live Stats & Trust Footer ───────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-transparent border border-purple-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">UniGate Intelligence</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? "بيانات مستقلة ومحدثة لخدمة طلاب الثانوية والمعادلات"
                  : "Independent, verified data for Egyptian high school & IGCSE students"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{isAr ? "بيانات مشفرة ومحمية 100%" : "100% Privacy Protected"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
