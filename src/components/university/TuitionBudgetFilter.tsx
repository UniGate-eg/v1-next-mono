"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Banknote, RotateCcw, Sparkles } from "lucide-react";

interface TuitionBudgetFilterProps {
  priceMin: number;
  priceMax: number;
  onPriceChange: (min: number, max: number) => void;
  onReset: () => void;
  maxLimit?: number;
}

const PRESET_TIERS = [
  {
    id: "all",
    labelEn: "All Budgets",
    labelAr: "جميع الميزانيات",
    min: 0,
    max: 400000,
    emoji: "🌐",
  },
  {
    id: "public",
    labelEn: "Public (<15K)",
    labelAr: "حكومية (أقل من 15 ألف)",
    min: 0,
    max: 15000,
    emoji: "🏛️",
  },
  {
    id: "national",
    labelEn: "National (40K–90K)",
    labelAr: "أهلية (40 – 90 ألف)",
    min: 40000,
    max: 90000,
    emoji: "🇪🇬",
  },
  {
    id: "private",
    labelEn: "Private (90K–160K)",
    labelAr: "خاصة (90 – 160 ألف)",
    min: 90000,
    max: 160000,
    emoji: "🏫",
  },
  {
    id: "premium",
    labelEn: "Premium (160K+)",
    labelAr: "دولية ومتميزة (+160 ألف)",
    min: 160000,
    max: 400000,
    emoji: "✨",
  },
];

// Visual distribution bar heights to simulate density across price spectrum
const DENSITY_BARS = [45, 30, 15, 20, 35, 60, 85, 70, 50, 65, 80, 95, 60, 40, 25, 30, 20, 15, 10, 8];

export function TuitionBudgetFilter({
  priceMin,
  priceMax,
  onPriceChange,
  onReset,
  maxLimit = 400000,
}: TuitionBudgetFilterProps) {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";

  const isFiltered = priceMin > 0 || priceMax < maxLimit;

  // Active preset tier check
  const activePreset = PRESET_TIERS.find(
    (tier) =>
      (tier.id === "all" && !isFiltered) ||
      (tier.min === priceMin && tier.max === priceMax)
  );

  const formatEGP = (val: number) => {
    if (val >= 1000) {
      return `${(val / 1000).toLocaleString()}K ${isArabic ? "ج.م" : "EGP"}`;
    }
    return `${val.toLocaleString()} ${isArabic ? "ج.م" : "EGP"}`;
  };

  const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), priceMax - 5000);
    onPriceChange(Math.max(0, val), priceMax);
  };

  const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), priceMin + 5000);
    onPriceChange(priceMin, Math.min(maxLimit, val));
  };

  const minPercent = (priceMin / maxLimit) * 100;
  const maxPercent = (priceMax / maxLimit) * 100;

  return (
    <div className="w-full bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Banknote className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              {isArabic ? "ميزانية المصروفات السنوية" : "Annual Tuition Budget"}
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                ({isArabic ? "جنيه مصري / سنة" : "EGP / Year"})
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold tracking-tight shadow-2xs">
            {priceMin === 0 && priceMax >= maxLimit
              ? isArabic
                ? "جميع الأسعار"
                : "Any Range"
              : `${formatEGP(priceMin)} – ${priceMax >= maxLimit ? `${formatEGP(maxLimit)}+` : formatEGP(priceMax)}`}
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isArabic ? "إعادة ضبط الميزانية" : "Reset budget filter"}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">{isArabic ? "إعادة ضبط" : "Reset"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Quick-Pill Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {PRESET_TIERS.map((tier) => {
          const isSelected = activePreset?.id === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => onPriceChange(tier.min, tier.max)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs scale-102"
                  : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/80 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tier.emoji}</span>
              <span>{isArabic ? tier.labelAr : tier.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Histogram Density Bars */}
      <div className="relative h-9 flex items-end gap-1 px-2 mb-1 pointer-events-none opacity-85">
        {DENSITY_BARS.map((height, idx) => {
          const barPercent = (idx / (DENSITY_BARS.length - 1)) * 100;
          const isInRange = barPercent >= minPercent && barPercent <= maxPercent;

          return (
            <div
              key={idx}
              className="flex-1 rounded-xs transition-colors duration-150"
              style={{
                height: `${height}%`,
                backgroundColor: isInRange
                  ? "rgba(16, 185, 129, 0.75)"
                  : "rgba(148, 163, 184, 0.25)",
              }}
            />
          );
        })}
      </div>

      {/* Dual Slider Control */}
      <div className="relative py-2 flex items-center">
        {/* Track background */}
        <div className="absolute left-0 right-0 h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>

        {/* Highlighted active range track */}
        <div
          className="absolute h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-75"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        ></div>

        {/* Min Input Slider */}
        <input
          type="range"
          min={0}
          max={maxLimit}
          step={5000}
          value={priceMin}
          onChange={handleMinSlider}
          className="absolute left-0 right-0 w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer focus:outline-none accent-emerald-600"
          style={{ zIndex: priceMin > maxLimit - 20000 ? 5 : 3 }}
        />

        {/* Max Input Slider */}
        <input
          type="range"
          min={0}
          max={maxLimit}
          step={5000}
          value={priceMax}
          onChange={handleMaxSlider}
          className="absolute left-0 right-0 w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer focus:outline-none accent-emerald-600"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Range Min / Max Helper Badges */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1 px-0.5">
        <span>0 {isArabic ? "ج.م" : "EGP"}</span>
        <span>100K</span>
        <span>200K</span>
        <span>300K</span>
        <span>400K+ {isArabic ? "ج.م" : "EGP"}</span>
      </div>
    </div>
  );
}
