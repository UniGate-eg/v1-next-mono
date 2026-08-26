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
    const jsonStr = JSON.stringify({ entityType, count: selectedIds.length, ids: selectedIds }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${entityType.toLowerCase()}s-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 text-white backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-4 sm:gap-6 ring-1 ring-white/10">
        <div className="flex items-center gap-2.5 border-r border-slate-700/80 pr-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-500/50">
            {selectedIds.length}
          </span>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            {selectedIds.length === 1 ? entityType : `${entityType}s`} Selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePublish}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Bulk Publish
          </button>

          <button
            onClick={handleArchive}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            Bulk Archive
          </button>

          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export
          </button>
        </div>

        <button
          onClick={handleDismiss}
          title="Cancel Selection"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
