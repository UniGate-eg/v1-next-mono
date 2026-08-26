import { universityRepository } from "../../../lib/di";
import { UniversityDataTable } from "../../../components/admin/UniversityDataTable";
import { Building2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Universities | UniGate Admin",
};

export default async function AdminUniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.q || "";
  const { data, total } = await universityRepository.findMany(
    undefined,
    page,
    20
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Academic Directory Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mt-1">
            Universities & Institutions Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Manage institutional profiles, degree tuitions, bilingual overviews, NAQAAE accreditations, and live completeness scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold border border-gray-200 dark:border-gray-700">
            {total} Institutions
          </span>
          <Link
            href="/admin/universities/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add University
          </Link>
        </div>
      </div>

      <UniversityDataTable 
        universities={data} 
        total={total} 
        currentPage={page} 
      />
    </div>
  );
}
