"use client";

import React, { useState } from "react";
import { UniversityDTO } from "@/types/university.types";
import { updateUniversityAction } from "@/app/admin/actions/university.actions";
import { useZodForm } from "@/hooks/useZodForm";
import { UpdateUniversitySchema } from "@/schemas/university.schema";
import {
  Building2,
  Globe,
  MapPin,
  Award,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GeneralInfoTabProps {
  university: UniversityDTO;
}

export function GeneralInfoTab({ university }: GeneralInfoTabProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useZodForm({
    schema: UpdateUniversitySchema,
    defaultValues: {
      nameEn: university.nameEn,
      nameAr: university.nameAr,
      shortName: university.shortName || "",
      slug: university.slug,
      emoji: university.emoji || "🏛️",
      type: university.type as any,
      educationModel: university.educationModel as any,
      governorate: university.governorate,
      city: university.city || "",
      addressEn: university.addressEn || "",
      addressAr: university.addressAr || "",
      website: university.website || "",
      logoUrl: university.logoUrl || "",
      established: university.established || undefined,
      qsRanking: university.qsRanking || "",
      theRanking: university.theRanking || "",
      overviewEn: university.overviewEn || "",
      overviewAr: university.overviewAr || "",
      publishStatus: university.publishStatus as any,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result = await updateUniversityAction({ id: university.id, data });
      if (result.success) {
        toast.success("Institutional profile updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update university");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Section 1: Core Institutional Identity ──────────────── */}
      <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Institutional Identity & Classification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official naming, URL slug, and ministry charter classification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              English Name *
            </label>
            <input
              {...form.register("nameEn")}
              placeholder="e.g. Cairo University"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Arabic Name *
            </label>
            <input
              {...form.register("nameAr")}
              dir="rtl"
              placeholder="e.g. جامعة القاهرة"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-arabic"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Slug (URL Identifier)
            </label>
            <input
              {...form.register("slug")}
              disabled
              className="w-full text-xs p-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Short Name / Acronym
            </label>
            <input
              {...form.register("shortName")}
              placeholder="e.g. CU / AUC"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              University Type
            </label>
            <select
              {...form.register("type")}
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="PUBLIC">Public Government University (حكومية)</option>
              <option value="PRIVATE">Private University (خاصة)</option>
              <option value="NATIONAL">National Ahleya University (أهلية)</option>
              <option value="INTERNATIONAL">International Branch Campus (دولية)</option>
              <option value="SPECIALIZED">Specialized Institution</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Publish Status
            </label>
            <select
              {...form.register("publishStatus")}
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="PUBLISHED">PUBLISHED (Visible in Public Search)</option>
              <option value="DRAFT">DRAFT (Admin Workspace Only)</option>
              <option value="ARCHIVED">ARCHIVED (Decommissioned)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section 2: Location & Campus ────────────────────────── */}
      <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Location & Physical Campus
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Governorate, city coordinates, and physical postal addresses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Governorate *
            </label>
            <input
              {...form.register("governorate")}
              placeholder="e.g. Giza / Cairo / Alexandria"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              City / District
            </label>
            <input
              {...form.register("city")}
              placeholder="e.g. Dokki / New Cairo"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Address (EN)
            </label>
            <input
              {...form.register("addressEn")}
              placeholder="e.g. 1 University St., Giza"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Address (AR)
            </label>
            <input
              {...form.register("addressAr")}
              dir="rtl"
              placeholder="e.g. ١ شارع الجامعة، الجيزة"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-arabic"
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Web, Rankings & Established ──────────────── */}
      <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Online Footprint & Global Rankings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official portal, QS world rank, and established year
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Official Website URL
            </label>
            <input
              {...form.register("website")}
              placeholder="https://cu.edu.eg"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Established Year
            </label>
            <input
              type="number"
              {...form.register("established", { valueAsNumber: true })}
              placeholder="1908"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              QS World Ranking
            </label>
            <input
              {...form.register("qsRanking")}
              placeholder="e.g. #371"
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Narrative Overviews ──────────────────────── */}
      <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Narrative Overviews & Admissions Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bilingual descriptive copy displayed on public university profiles
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Overview (English)
            </label>
            <textarea
              {...form.register("overviewEn")}
              rows={4}
              placeholder="Detailed English narrative..."
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Overview (Arabic)
            </label>
            <textarea
              {...form.register("overviewAr")}
              rows={4}
              dir="rtl"
              placeholder="نبذة تفصيلية باللغة العربية..."
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-arabic"
            />
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>Save Institutional Changes</span>
        </button>
      </div>
    </form>
  );
}
