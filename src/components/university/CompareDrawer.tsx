"use client";

import Link from "next/link";
import { useCompareStore } from "@/stores/compareStore";
import { Button } from "@/components/ui/button";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getUniversitiesByIdsAction } from "@/server/actions/university.actions";
import type { UniversityWithMajors } from "@/server/repositories/interfaces/IUniversityRepository";

export function CompareDrawer() {
  const { selectedIds, isOpen, setIsOpen, remove, clear } = useCompareStore();
  const [universities, setUniversities] = useState<UniversityWithMajors[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setUniversities([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getUniversitiesByIdsAction(selectedIds).then((res) => {
      if (isMounted) {
        if (res.success) {
          setUniversities(res.data);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedIds]);

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="container mx-auto max-w-4xl pointer-events-auto">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Compare Institutions ({selectedIds.length}/3)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select up to 3 universities to evaluate side-by-side
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="h-8 text-xs text-slate-500 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
              <Button size="sm" asChild className="h-8 px-4 text-xs font-semibold">
                <Link href="/compare">
                  <span>Open Comparison Matrix</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Mini preview tags */}
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {universities.map((uni) => (
              <div
                key={uni.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="font-semibold">{uni.nameEn}</span>
                <button
                  type="button"
                  onClick={() => remove(uni.id)}
                  className="text-slate-400 hover:text-red-500"
                  aria-label={`Remove ${uni.nameEn}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
