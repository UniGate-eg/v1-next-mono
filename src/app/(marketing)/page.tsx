import Link from "next/link";
import { UniversityRepository } from "@/server/repositories/UniversityRepository";
import { UniversityService } from "@/server/services/UniversityService";
import { UniversityCard } from "@/components/university/UniversityCard";
import { UniversitySearch } from "@/components/university/UniversitySearch";
import { Button } from "@/components/ui/button";
import {
  Compass,
  GraduationCap,
  Scale,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  Building2,
  Globe2,
  Sparkles,
} from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
  const repository = new UniversityRepository();
  const service = new UniversityService(repository);

  const featured = await service.getFeaturedUniversities();

  const institutionPills = [
    { label: "Public Universities (حكومية)", type: "PUBLIC", count: "27+" },
    { label: "National Universities (أهلية)", type: "NATIONAL", count: "20+" },
    { label: "Private Universities (خاصة)", type: "PRIVATE", count: "30+" },
    { label: "International Campuses (دولية)", type: "INTERNATIONAL", count: "10+" },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-linear-to-b from-blue-50/50 via-white to-slate-50/50 py-16 sm:py-24 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/80 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Egypt&apos;s Comprehensive Higher Education Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-[1.15]">
              Find & Compare Your Ideal{" "}
              <span className="text-blue-600 dark:text-blue-400">Egyptian University</span>
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 sm:text-lg leading-relaxed font-sans">
              Explore public, private, national, and international institutions across Egypt. Compare degree durations, faculties, and track your admission progress in one unified platform.
            </p>

            {/* Search Box in Hero */}
            <div className="pt-2">
              <UniversitySearch placeholder="Search university or major (e.g. Computer Science, جامعة القاهرة, GUC)..." />
            </div>

            {/* Quick Type Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {institutionPills.map((pill) => (
                <Link
                  key={pill.type}
                  href={`/universities?type=${pill.type}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur-xs transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <span>{pill.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bilingual Exploration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Full Arabic and English directory coverage with verified major lists, degree types, and governorate filtering.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Side-by-Side Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Compare up to 3 universities simultaneously across locations, degree levels, and available faculties.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Kanban Dashboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track your admissions journey from Interested to Accepted with private notes and custom status cards.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Universities Preview */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Institutions
            </h2>
            <p className="text-xs text-slate-500">Popular higher education choices in Egypt</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/universities" className="inline-flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((uni) => (
            <UniversityCard key={uni.id} university={uni} />
          ))}
        </div>
      </section>
    </div>
  );
}
