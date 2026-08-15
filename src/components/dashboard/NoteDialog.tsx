"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StickyNote, Save } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";

interface NoteDialogProps {
  bookmarkId: string;
  universityName: string;
  initialNotes?: string | null;
}

export function NoteDialog({
  bookmarkId,
  universityName,
  initialNotes,
}: NoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const { updateBookmark } = useBookmarks();

  const handleSave = () => {
    updateBookmark({
      bookmarkId,
      notes,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
          title="Edit Notes"
        >
          <StickyNote className="h-3.5 w-3.5" />
          <span>{initialNotes ? "Edit Notes" : "Add Note"}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Private Notes: {universityName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Save submission deadlines, required paperwork, test dates, and tuition notes. Visible only to you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={5}
            placeholder="e.g. Entrance test scheduled for August 20th. Need to submit certified Thanaweya transcript and medical certificate..."
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          />
          <div className="text-right text-[10px] text-slate-400">
            {notes.length} / 500 characters
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-3.5 w-3.5 mr-1" />
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
