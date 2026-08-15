"use client";

import { useCompareStore } from "@/stores/compareStore";
import { useEffect, useState } from "react";
import { getUniversitiesByIdsAction } from "@/server/actions/university.actions";
import type { UniversityWithMajors } from "@/server/repositories/interfaces/IUniversityRepository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, MapPin, Calendar, BookOpen, Award, Clock } from "lucide-react";
import Link from "next/link";
import { formatGovernorate } from "@/lib/utils";

export function CompareMatrix() {
  const { selectedIds, remove, clear } = useCompareStore();
  const [universities, setUniversities] = useState<UniversityWithMajors[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setUniversities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getUniversitiesByIdsAction(selectedIds).then((res) => {
      if (res.success) {
        setUniversities(res.data);
      }
      setLoading(false);
    });
  }, [selectedIds]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Loading comparison details...</p>
      </div>
    );
  }

  if (universities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No Universities Selected for Comparison
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Browse the university directory and click &ldquo;Compare&rdquo; on up to 3 institutions.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/universities">Browse Universities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Comparing {universities.length} Institutions
          </h2>
          <p className="text-xs text-slate-500">Side-by-side dimension breakdown</p>
        </div>
        <Button variant="outline" size="sm" onClick={clear}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <th className="p-4 font-semibold text-slate-500 w-48 min-w-44">Dimension</th>
              {universities.map((uni) => (
                <th key={uni.id} className="p-4 font-bold text-slate-900 dark:text-white min-w-64">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-base font-bold">{uni.nameEn}</span>
                      <p className="text-xs font-medium text-slate-500 font-arabic">{uni.nameAr}</p>
                    </div>
                    <button
                      onClick={() => remove(uni.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-4 font-semibold text-slate-500">Institution Type</td>
              {universities.map((uni) => (
                <td key={uni.id} className="p-4 font-medium">
                  <Badge variant="secondary">{uni.type}</Badge>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-500">Governorate</td>
              {universities.map((uni) => (
                <td key={uni.id} className="p-4 font-medium">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>{formatGovernorate(uni.governorate)}</span>
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-500">Established</td>
              {universities.map((uni) => (
                <td key={uni.id} className="p-4 font-medium text-slate-700 dark:text-slate-300">
                  {uni.established ? `Year ${uni.established}` : "N/A"}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-500">Official Portal</td>
              {universities.map((uni) => (
                <td key={uni.id} className="p-4">
                  {uni.website ? (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Not available</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-500 align-top">Overview</td>
              {universities.map((uni) => (
                <td key={uni.id} className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed align-top">
                  {uni.description || "No description provided."}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-500 align-top">
                Available Majors ({universities.map((u) => u.majors?.length || 0).join(" vs ")})
              </td>
              {universities.map((uni) => (
                <td key={uni.id} className="p-4 align-top">
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-2">
                    {uni.majors?.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-md border border-slate-100 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">{m.nameEn}</div>
                        <div className="text-[11px] text-slate-500 font-arabic">{m.nameAr}</div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{m.degree}</span>
                          <span>{m.duration} Yrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
