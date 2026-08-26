"use client";

import React, { useState } from "react";
import { CheckCircle, Archive, Download, X, Loader2 } from "lucide-react";
import { bulkPublishAction, bulkArchiveAction } from "../../../server/actions/admin/bulk.admin.actions";
import { useRouter } from "next/navigation";

interface BulkActionBarProps {
  selectedIds: string[];
  entityType?: "University" | "DegreeProgram";
  onClear?: () => void;
  onClearSelection?: () => void;
  onSuccess?: () => void;
}

export function BulkActionBar({
  selectedIds,
  entityType = "University",
  onClear,
  onClearSelection,
  onSuccess,
}: BulkActionBarProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDismiss = () => {
    onClear?.();
    onClearSelection?.();
  };

  if (selectedIds.length === 0) return null;

  const handlePublish = async () => {
    if (!confirm(`Are you sure you want to bulk publish ${selectedIds.length} ${entityType}(s)?`)) return;
    try {
      setLoading(true);
      const res = await bulkPublishAction({ action: "PUBLISH", universityIds: selectedIds });
      if (!res.success) {
        alert(res.error || "Bulk publish failed");
      } else {
        handleDismiss();
        router.refresh();
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(`Are you sure you want to bulk archive ${selectedIds.length} ${entityType}(s)?`)) return;
    try {
      setLoading(true);
      const res = await bulkArchiveAction({ action: "ARCHIVE", universityIds: selectedIds });
      if (!res.success) {
        alert(res.error || "Bulk archive failed");
      } else {
        handleDismiss();
        router.refresh();
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedIds, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bulk-${entityType.toLowerCase()}-export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#101322]/95 text-white backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl border border-[#27314E] flex items-center gap-6 ring-1 ring-white/10">
        <div className="flex items-center gap-3 border-r border-[#27314E] pr-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-[#A78BFA] text-xs font-black text-[#0A0B14] shadow-md shadow-purple-500/40">
            {selectedIds.length}
          </span>
          <span className="text-xs font-extrabold text-slate-200">
            {selectedIds.length === 1 ? entityType : `${entityType}s`} Selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePublish}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Bulk Publish
          </button>

          <button
            onClick={handleArchive}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#181D30] hover:bg-[#222944] text-slate-300 text-xs font-bold border border-[#27314E] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            Bulk Archive
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#181D30] hover:bg-[#222944] text-slate-300 text-xs font-bold border border-[#27314E] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export JSON
          </button>
        </div>

        <button
          onClick={handleDismiss}
          title="Cancel Selection"
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1C2238] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
