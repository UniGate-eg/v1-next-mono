import { Suspense } from "react";
import { UniversityRepository } from "@/server/repositories/UniversityRepository";
import { UniversityService } from "@/server/services/UniversityService";
import { UniversityCard } from "@/components/university/UniversityCard";
import { UniversitySearch } from "@/components/university/UniversitySearch";
import { UniversityFilters } from "@/components/university/UniversityFilters";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 3600; // ISR: 1 hour cache revalidation

export const metadata: Metadata = {
  title: "Egyptian Universities Directory — UniCompass",
  description:
    "Search and filter all Egyptian public, private, national, and international universities by governorate, majors, and institution type.",
};

interface UniversitiesPageProps {
  searchParams: Promise<{
    type?: string;
    governorate?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function UniversitiesPage({
  searchParams,
}: UniversitiesPageProps) {
  const params = await searchParams;
  const repository = new UniversityRepository();
  const service = new UniversityService(repository);

  const filters = {
    type: params.type as any,
    governorate: params.governorate,
    search: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 30,
  };

  const { data: universities, meta } = await service.getUniversities(filters);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
          <GraduationCap className="h-4 w-4" />
          <span>Higher Education in Egypt • التعليم العالي في مصر</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
          Egyptian Universities Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Browse verified university profiles across all 27 Egyptian governorates. Filter by public, private, national, and international campuses.
        </p>
      </div>

      {/* Search Bar */}
      <Suspense fallback={<div className="h-11 bg-slate-100 rounded-lg animate-pulse" />}>
        <UniversitySearch initialSearch={params.search} />
      </Suspense>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-48 bg-slate-100 rounded-xl animate-pulse" />}>
            <UniversityFilters />
          </Suspense>
        </div>

        {/* Right Catalog List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{universities.length}</strong> of{" "}
              <strong className="text-slate-900 dark:text-white">{meta.total}</strong> Universities
            </span>
            <span>Page {meta.page} of {meta.totalPages}</span>
          </div>

          {universities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <GraduationCap className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                No universities found matching your criteria
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Try clearing some filters or searching with a different term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {universities.map((uni) => (
                <UniversityCard key={uni.id} university={uni} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
