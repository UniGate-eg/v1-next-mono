import { universityRepository } from "../../../lib/di";
import { UniversityDataTable } from "../../../components/admin/UniversityDataTable";

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
    undefined, // filters
    page,
    20 // limit
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Universities</h2>
        <p className="text-muted-foreground mt-2">
          Manage university profiles, faculties, and degree programs.
        </p>
      </div>

      <UniversityDataTable 
        universities={data} 
        total={total} 
        currentPage={page} 
      />
    </div>
  );
}
