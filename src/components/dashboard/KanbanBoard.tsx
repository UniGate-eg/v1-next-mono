"use client";

import { useBookmarks } from "@/hooks/useBookmarks";
import { KanbanColumn } from "./KanbanColumn";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Plus } from "lucide-react";
import type { AppStatus } from "@/schemas/bookmark.schema";

const COLUMNS: {
  status: AppStatus;
  titleEn: string;
  titleAr: string;
  colorClass: string;
}[] = [
  { status: "INTERESTED", titleEn: "Interested", titleAr: "قائمة الاهتمام", colorClass: "bg-blue-500" },
  { status: "RESEARCHING", titleEn: "Researching", titleAr: "بحث وتدقيق", colorClass: "bg-purple-500" },
  { status: "APPLIED", titleEn: "Applied", titleAr: "تم التقديم", colorClass: "bg-amber-500" },
  { status: "ACCEPTED", titleEn: "Accepted", titleAr: "تم القبول 🎉", colorClass: "bg-emerald-500" },
  { status: "REJECTED", titleEn: "Rejected", titleAr: "مرفوض", colorClass: "bg-slate-400" },
];

export function KanbanBoard() {
  const { bookmarks, isLoading, isError } = useBookmarks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-96 rounded-xl bg-slate-100 animate-pulse dark:bg-slate-900" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Failed to load admission pipeline. Please refresh the page.
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <GraduationCap className="mx-auto h-12 w-12 text-slate-400" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Application Pipeline is Empty
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse Egyptian universities from the catalog and add them to your tracker to organize admissions and notes.
          </p>
        </div>
        <Button asChild>
          <Link href="/universities">
            <Plus className="h-4 w-4 mr-1.5" />
            Explore Universities Directory
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {COLUMNS.map((col) => {
        const columnBookmarks = bookmarks.filter((b) => b.status === col.status);
        return (
          <KanbanColumn
            key={col.status}
            status={col.status}
            titleEn={col.titleEn}
            titleAr={col.titleAr}
            colorClass={col.colorClass}
            bookmarks={columnBookmarks}
          />
        );
      })}
    </div>
  );
}
