import { universityRepository } from "../../../lib/di";
import { UniversityDataTable } from "../../../components/admin/UniversityDataTable";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "University Directory | UniGate Admin",
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
    undefined, // filters
    page,
    20 // limit
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Academic Directory Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage university profiles, faculties, degree tuitions, accreditation data, and monitor quality scores.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
          {total} Total Institutions
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
