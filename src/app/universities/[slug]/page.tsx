import { notFound } from "next/navigation";
import { UniversityRepository } from "@/server/repositories/UniversityRepository";
import { UniversityService } from "@/server/services/UniversityService";
import { Badge } from "@/components/ui/badge";
import { MajorList } from "@/components/university/MajorList";
import { CompareToggleButton } from "@/components/university/CompareToggleButton";
import { SuggestionDialog } from "@/components/university/SuggestionDialog";
import { MapPin, Calendar, ExternalLink, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { formatGovernorate } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 3600; // ISR: 1 hour revalidation

interface UniversityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const repository = new UniversityRepository();
  const service = new UniversityService(repository);
  const result = await service.getUniversities({ page: 1, limit: 100 });
  return result.data.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: UniversityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repository = new UniversityRepository();
  const service = new UniversityService(repository);

  try {
    const university = await service.getUniversityBySlug(slug);
    return {
      title: `${university.nameEn} (${university.nameAr}) — UniCompass`,
      description:
        university.description ||
        `Explore degrees, faculties, and admission details for ${university.nameEn} in ${university.governorate}, Egypt.`,
    };
  } catch {
    return {
      title: "University Profile — UniCompass",
    };
  }
}

export default async function UniversityDetailPage({ params }: UniversityPageProps) {
  const { slug } = await params;
  const repository = new UniversityRepository();
  const service = new UniversityService(repository);

  let university;
  try {
    university = await service.getUniversityBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Directory</span>
        </Link>
      </div>

      {/* University Hero Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-semibold text-xs">
                {university.type}
              </Badge>
              <span className="text-xs text-slate-400">•</span>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatGovernorate(university.governorate)}</span>
              </div>
              {university.established && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Est. {university.established}</span>
                  </div>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {university.nameEn}
            </h1>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-400 font-arabic">
              {university.nameAr}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CompareToggleButton universityId={university.id} size="default" />
            <SuggestionDialog universityName={university.nameEn} />
          </div>
        </div>

        {/* Overview & Quick Links */}
        <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 dark:border-slate-800 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overview & Accreditation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {university.description ||
                `${university.nameEn} is a distinguished higher education institution located in ${university.governorate}, Egypt, offering accredited degree programs across diverse faculties.`}
            </p>
          </div>

          <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Links
            </h4>
            {university.website ? (
              <a
                href={university.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs font-semibold text-blue-600 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <span>Visit University Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="text-xs text-slate-400">No official link submitted</p>
            )}
          </div>
        </div>
      </div>

      {/* Majors Listing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <MajorList majors={university.majors || []} />
      </div>
    </div>
  );
}
