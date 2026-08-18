"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { reviewSuggestionAction } from "@/app/admin/actions/suggestion.admin.actions";
import { Check, X, ExternalLink } from "lucide-react";

export function SuggestionReviewDialog({ suggestion }: { suggestion: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"MERGED" | "REJECTED" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const router = useRouter();

  const handleReview = async (status: "MERGED" | "REJECTED") => {
    setLoading(status);
    try {
      const res = await reviewSuggestionAction(suggestion.id, status, adminNotes);
      if (res.success) {
        toast.success(`Suggestion ${status === "MERGED" ? "Merged" : "Rejected"} successfully`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to review suggestion");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Suggestion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="font-semibold text-slate-500">University</div>
            <div className="col-span-2 font-medium">{suggestion.university?.nameEn || suggestion.universityId}</div>

            <div className="font-semibold text-slate-500">Field</div>
            <div className="col-span-2">{suggestion.suggestedField}</div>

            <div className="font-semibold text-slate-500">Suggested Value</div>
            <div className="col-span-2 bg-slate-50 p-2 rounded border">{suggestion.suggestedValue}</div>

            {suggestion.notes && (
              <>
                <div className="font-semibold text-slate-500">Notes</div>
                <div className="col-span-2">{suggestion.notes}</div>
              </>
            )}

            {suggestion.sourceUrl && (
              <>
                <div className="font-semibold text-slate-500">Source</div>
                <div className="col-span-2">
                  <a href={suggestion.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t">
            <label className="block text-sm font-medium mb-2">Admin Notes / Feedback</label>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Optional notes about why this was merged or rejected..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleReview("REJECTED")}
            disabled={!!loading}
          >
            {loading === "REJECTED" ? "Rejecting..." : (
              <>
                <X className="w-4 h-4 mr-2" /> Reject
              </>
            )}
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleReview("MERGED")}
            disabled={!!loading}
          >
            {loading === "MERGED" ? "Merging..." : (
              <>
                <Check className="w-4 h-4 mr-2" /> Merge & Approve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
