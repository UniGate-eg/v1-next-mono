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
    <div className="space-y-10 pb-20">
      {/* Spacious Dark Header Banner */}
      <div className="rounded-[36px] bg-[#101320] border border-[#1C2236] p-10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Academic Directory Governance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Universities & Institutions Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Manage institutional profiles, degree tuitions, bilingual overviews, NAQAAE accreditations, and live completeness scores.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="px-5 py-2.5 rounded-2xl bg-[#151929] text-slate-300 text-xs font-bold border border-[#232A3E]">
            {total} Institutions Total
          </span>
          <Link
            href="/admin/universities/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#C4B5FD] hover:bg-[#DDD6FE] text-[#0A0B14] text-xs font-black shadow-xl shadow-purple-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add University
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
