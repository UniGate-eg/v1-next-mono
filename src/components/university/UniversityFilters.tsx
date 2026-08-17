"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import type { UniversityType } from "@prisma/client";

const EGYPTIAN_GOVERNORATES = [
  { value: "Cairo", labelEn: "Cairo", labelAr: "القاهرة" },
  { value: "Giza", labelEn: "Giza", labelAr: "الجيزة" },
  { value: "Alexandria", labelEn: "Alexandria", labelAr: "الإسكندرية" },
  { value: "Qalyubia", labelEn: "Qalyubia", labelAr: "القليوبية" },
  { value: "Dakahlia", labelEn: "Dakahlia", labelAr: "الدقهلية" },
  { value: "Sharqia", labelEn: "Sharqia", labelAr: "الشرقية" },
  { value: "Gharbia", labelEn: "Gharbia", labelAr: "الغربية" },
  { value: "Monufia", labelEn: "Monufia", labelAr: "المنوفية" },
  { value: "Beheira", labelEn: "Beheira", labelAr: "البحيرة" },
  { value: "Ismailia", labelEn: "Ismailia", labelAr: "الإسماعيلية" },
  { value: "Suez", labelEn: "Suez", labelAr: "السويس" },
  { value: "Port Said", labelEn: "Port Said", labelAr: "بورسعيد" },
  { value: "Damietta", labelEn: "Damietta", labelAr: "دمياط" },
  { value: "Kafr El Sheikh", labelEn: "Kafr El Sheikh", labelAr: "كفر الشيخ" },
  { value: "Fayoum", labelEn: "Fayoum", labelAr: "الفيوم" },
  { value: "Beni Suef", labelEn: "Beni Suef", labelAr: "بني سويف" },
  { value: "Minya", labelEn: "Minya", labelAr: "المنيا" },
  { value: "Assiut", labelEn: "Assiut", labelAr: "أسيوط" },
  { value: "Sohag", labelEn: "Sohag", labelAr: "سوهاج" },
  { value: "Qena", labelEn: "Qena", labelAr: "قنا" },
  { value: "Luxor", labelEn: "Luxor", labelAr: "الأقصر" },
  { value: "Aswan", labelEn: "Aswan", labelAr: "أسوان" },
  { value: "Red Sea", labelEn: "Red Sea", labelAr: "البحر الأحمر" },
  { value: "New Valley", labelEn: "New Valley", labelAr: "الوادي الجديد" },
  { value: "Matrouh", labelEn: "Matrouh", labelAr: "مطروح" },
  { value: "North Sinai", labelEn: "North Sinai", labelAr: "شمال سيناء" },
  { value: "South Sinai", labelEn: "South Sinai", labelAr: "جنوب سيناء" },
];

const TYPES: { value: UniversityType | "ALL"; labelEn: string; labelAr: string }[] = [
  { value: "ALL", labelEn: "All Types", labelAr: "الكل" },
  { value: "PUBLIC", labelEn: "Public", labelAr: "حكومية" },
  { value: "PRIVATE", labelEn: "Private", labelAr: "خاصة" },
  { value: "NATIONAL", labelEn: "National", labelAr: "أهلية" },
  { value: "INTERNATIONAL", labelEn: "International", labelAr: "دولية" },
];

export function UniversityFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = (searchParams.get("type") as UniversityType | null) || "ALL";
  const currentGov = searchParams.get("governorate") || "";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/universities?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/universities");
  };

  const hasActiveFilters = currentType !== "ALL" || Boolean(currentGov) || Boolean(searchParams.get("search"));

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Filter Institutions (تصفية الجامعات)
          </h4>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* University Type Pills */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Institution Type (نوع الجامعة)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((type) => {
            const isSelected = currentType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateParam("type", type.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <span>{type.labelEn}</span>{" "}
                <span className="opacity-75 font-arabic">({type.labelAr})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Governorate Filter */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Governorate (المحافظة)
        </label>
        <select
          value={currentGov}
          onChange={(e) => updateParam("governorate", e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        >
          <option value="">All Governorates (جميع المحافظات)</option>
          {EGYPTIAN_GOVERNORATES.map((gov) => (
            <option key={gov.value} value={gov.value}>
              {gov.labelEn} — {gov.labelAr}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
