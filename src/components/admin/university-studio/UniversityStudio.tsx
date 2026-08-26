"use client";

import React, { useState } from "react";
import { UniversityDTO } from "@/types/university.types";
import { GeneralInfoTab } from "./tabs/GeneralInfoTab";
import { FacultiesTab } from "./tabs/FacultiesTab";
import { ProgramsTab } from "./tabs/ProgramsTab";
import { CompletenessScore } from "@/components/admin/shared/CompletenessScore";
import { StaleBadge } from "@/components/admin/shared/StaleBadge";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  FileText,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

interface UniversityStudioProps {
  university: UniversityDTO;
}

type TabType = "general" | "faculties" | "programs";

export function UniversityStudio({ university }: UniversityStudioProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  const facultiesList = university.faculties || [];
  const programsList = university.degreePrograms || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* ── Studio Header & Breadcrumbs ───────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            href="/admin/universities"
            className="hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Catalog Directory</span>
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold truncate">
            {university.nameEn}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/20 shrink-0">
              {university.emoji || "🏛️"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {university.nameEn}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    university.publishStatus === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  {university.publishStatus}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-arabic">
                {university.nameAr} • <span className="font-sans font-medium">{university.type}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <StaleBadge updatedAt={university.updatedAt} />
            <CompletenessScore score={(university as any).completenessScore ?? 85} size="md" />

            <Link
              href={`/universities/${university.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Apple-Style Segmented Navigation Tabs ──────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "general"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>General Identity</span>
        </button>

        <button
          onClick={() => setActiveTab("faculties")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "faculties"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Colleges & Faculties</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300">
            {facultiesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("programs")}
          className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "programs"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Degree Programs & Majors</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300">
            {programsList.length}
          </span>
        </button>
      </div>

      {/* ── Active Tab Workspace ──────────────────────────────────── */}
      <div className="pt-2">
        {activeTab === "general" && <GeneralInfoTab university={university} />}
        {activeTab === "faculties" && (
          <FacultiesTab universityId={university.id} faculties={facultiesList} />
        )}
        {activeTab === "programs" && (
          <ProgramsTab
            universityId={university.id}
            degreePrograms={programsList}
            faculties={facultiesList}
          />
        )}
      </div>
    </div>
  );
}
