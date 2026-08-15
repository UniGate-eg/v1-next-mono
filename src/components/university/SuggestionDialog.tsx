"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { SuggestionForm } from "@/components/forms/SuggestionForm";

interface SuggestionDialogProps {
  universityName?: string;
}

export function SuggestionDialog({ universityName }: SuggestionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <MessageSquarePlus className="h-3.5 w-3.5 text-slate-500" />
          <span>Suggest Correction</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Suggest Data Correction
          </DialogTitle>
          <DialogDescription className="text-xs">
            Help keep Egypt&apos;s university directory accurate by submitting missing majors or updated contact links.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <SuggestionForm
            universityName={universityName}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
