"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NoteDialog } from "@/components/dashboard/NoteDialog";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { AppStatus } from "@/schemas/bookmark.schema";
import {
  MapPin,
  ExternalLink,
  Trash2,
  MoveRight,
} from "lucide-react";
import { formatGovernorate } from "@/lib/utils";

const STAGES: { value: AppStatus; label: string }[] = [
  { value: "INTERESTED", label: "Interested (مهتم)" },
  { value: "RESEARCHING", label: "Researching (بحث وتدقيق)" },
  { value: "APPLIED", label: "Applied (تم التقديم)" },
  { value: "ACCEPTED", label: "Accepted (مقبول)" },
  { value: "REJECTED", label: "Rejected (مرفوض)" },
];

interface BookmarkCardProps {
  bookmark: {
    id: string;
    status: AppStatus;
    notes: string | null;
    university: {
      id: string;
      slug: string;
      nameEn: string;
      nameAr: string;
      type: string;
      governorate: string;
      website: string | null;
    };
  };
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const { updateBookmark, deleteBookmark } = useBookmarks();
  const uni = bookmark.university;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all duration-200 hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <Link
            href={`/universities/${uni.slug}`}
            className="text-sm font-bold text-slate-900 hover:text-blue-600 dark:text-white line-clamp-1"
          >
            {uni.nameEn}
          </Link>
          <p className="text-[11px] font-semibold text-slate-500 font-arabic line-clamp-1">
            {uni.nameAr}
          </p>
        </div>

        <button
          onClick={() => deleteBookmark(bookmark.id)}
          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
          title="Delete from Tracker"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Meta tags */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {uni.type}
        </Badge>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-slate-400" />
          <span>{formatGovernorate(uni.governorate)}</span>
        </div>
      </div>

      {/* Notes Preview if any */}
      {bookmark.notes && (
        <div className="rounded-lg bg-amber-50/60 p-2.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200/60 dark:border-amber-900/60">
          <p className="line-clamp-2 text-[11px] leading-relaxed">
            &ldquo;{bookmark.notes}&rdquo;
          </p>
        </div>
      )}

      {/* Footer controls: Move stage & Notes */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
        <NoteDialog
          bookmarkId={bookmark.id}
          universityName={uni.nameEn}
          initialNotes={bookmark.notes}
        />

        <div className="flex items-center gap-1">
          <select
            value={bookmark.status}
            onChange={(e) =>
              updateBookmark({
                bookmarkId: bookmark.id,
                status: e.target.value as AppStatus,
              })
            }
            className="h-7 rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            {STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
