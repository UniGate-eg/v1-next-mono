"use client";

import React, { useState } from "react";
import { bulkPublishAction, bulkArchiveAction } from "../../../server/actions/admin/bulk.admin.actions";
import { CheckCheck, Archive, Loader2, X, Download } from "lucide-react";
import { usePermission } from "../../../hooks/usePermission";

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSuccess: () => void;
}

export function BulkActionBar({ selectedIds, onClearSelection, onSuccess }: BulkActionBarProps) {
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermission();

  if (selectedIds.length === 0) return null;

  const canBulkMutate = hasPermission("data:bulk_mutate");

  const handleBulkPublish = async () => {
    if (!confirm(`Are you sure you want to bulk publish ${selectedIds.length} institution(s)?`)) return;
    try {
      setLoading(true);
      const res = await bulkPublishAction({ universityIds: selectedIds, action: "PUBLISH" });
      if (!res.success) {
        alert(res.error || "Bulk publish failed");
      } else {
        onClearSelection();
        onSuccess();
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    if (!confirm(`Are you sure you want to bulk archive ${selectedIds.length} institution(s)?`)) return;
    try {
      setLoading(true);
      const res = await bulkArchiveAction({ universityIds: selectedIds, action: "ARCHIVE" });
      if (!res.success) {
        alert(res.error || "Bulk archive failed");
      } else {
        onClearSelection();
        onSuccess();
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-slate-900 text-white rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xl border border-slate-700/80 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
            {selectedIds.length}
          </span>
          <span className="text-xs font-semibold text-slate-200">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          {canBulkMutate && (
            <>
              <button
                onClick={handleBulkPublish}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Bulk Publish
              </button>

              <button
                onClick={handleBulkArchive}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-xs transition-colors"
              >
                <Archive className="w-3.5 h-3.5" /> Bulk Archive
              </button>
            </>
          )}

          <button
            onClick={() => {
              const json = JSON.stringify(selectedIds, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `selected-universities-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Selected
          </button>
        </div>

        <button
          onClick={onClearSelection}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
