import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CompareToggleButton } from "@/components/university/CompareToggleButton";
import { MapPin, Calendar, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import type { UniversityType } from "@/schemas/university.schema";
import type { UniversityWithMajors } from "@/server/repositories/interfaces/IUniversityRepository";
import { formatGovernorate } from "@/lib/utils";

interface UniversityCardProps {
  university: UniversityWithMajors;
}

const typeConfig: Record<
  UniversityType,
  { labelEn: string; labelAr: string; variant: "public" | "private" | "national" | "international" }
> = {
  PUBLIC: { labelEn: "Public University", labelAr: "جامعة حكومية", variant: "public" },
  PRIVATE: { labelEn: "Private University", labelAr: "جامعة خاصة", variant: "private" },
  NATIONAL: { labelEn: "National University", labelAr: "جامعة أهلية", variant: "national" },
  INTERNATIONAL: { labelEn: "International University", labelAr: "جامعة دولية", variant: "international" },
};

export function UniversityCard({ university }: UniversityCardProps) {
  const typeInfo = typeConfig[university.type] || {
    labelEn: university.type,
    labelAr: university.type,
    variant: "secondary",
  };

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border border-slate-200/90 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Badge variant={typeInfo.variant} className="font-medium text-[11px]">
              {typeInfo.labelEn} • {typeInfo.labelAr}
            </Badge>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white leading-tight">
              <Link href={`/universities/${university.slug}`} className="hover:underline">
                {university.nameEn}
              </Link>
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-arabic">
              {university.nameAr}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 space-y-3">
        {university.description && (
          <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {university.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatGovernorate(university.governorate)}</span>
          </div>

          {university.established && (
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Est. {university.established}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span>{university.majors?.length || 0} Majors</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <CompareToggleButton universityId={university.id} size="sm" />

        <Link
          href={`/universities/${university.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group/link"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
