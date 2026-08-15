import { BookmarkCard } from "./BookmarkCard";
import type { AppStatus } from "@/schemas/bookmark.schema";

interface KanbanColumnProps {
  status: AppStatus;
  titleEn: string;
  titleAr: string;
  colorClass: string;
  bookmarks: any[];
}

export function KanbanColumn({
  status,
  titleEn,
  titleAr,
  colorClass,
  bookmarks,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60 min-w-72 flex-1">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {titleEn}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 font-arabic">
              {titleAr}
            </span>
          </div>
        </div>

        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {bookmarks.length}
        </span>
      </div>

      {/* Cards list */}
      <div className="mt-3 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[calc(100vh-18rem)] min-h-36">
        {bookmarks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800/80">
            No applications in this stage
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))
        )}
      </div>
    </div>
  );
}
