"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Award, BookOpen } from "lucide-react";
import type { Major } from "@/schemas/university.schema";

interface MajorListProps {
  majors: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    duration: number;
    degree: string;
  }[];
}

export function MajorList({ majors }: MajorListProps) {
  const [query, setQuery] = useState("");

  const filteredMajors = majors.filter(
    (m) =>
      m.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      m.nameAr.includes(query) ||
      m.degree.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Offered Academic Programs & Majors ({majors.length})
          </h3>
        </div>

        {majors.length > 5 && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter majors..."
              className="h-9 pl-9 text-xs"
            />
          </div>
        )}
      </div>

      {filteredMajors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
          No academic majors match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMajors.map((major) => (
            <div
              key={major.id}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {major.nameEn}
                </h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-arabic">
                  {major.nameAr}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                <div className="flex items-center gap-1 font-medium">
                  <Award className="h-3.5 w-3.5 text-blue-600" />
                  <span>{major.degree}</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{major.duration} Years</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
