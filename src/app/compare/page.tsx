import { CompareMatrix } from "@/components/university/CompareMatrix";
import { Scale, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Egyptian Universities — UniCompass",
  description:
    "Evaluate Egyptian universities side-by-side: compare governorates, majors, degree levels, and institution types.",
};

export default function ComparePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Directory</span>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
          <Scale className="h-4 w-4" />
          <span>Decision Matrix • أداة مقارنة الجامعات</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
          Side-by-Side University Comparison
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Evaluate key differences across faculties, degree durations, locations, and institution types to find your optimal higher education fit.
        </p>
      </div>

      <CompareMatrix />
    </div>
  );
}
