"use client";

import React, { useState } from "react";
import { validateRollbackPreflightAction, executeRollbackAction } from "../../../server/actions/admin/rollback.admin.actions";
import { RotateCcw, AlertTriangle, CheckCircle2, Loader2, FileJson } from "lucide-react";
import { useRouter } from "next/navigation";

interface RollbackDialogProps {
  log: {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    beforeState: any;
    afterState: any;
    createdAt: string | Date;
  };
}

export function RollbackDialog({ log }: RollbackDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preflight, setPreflight] = useState<{ valid: boolean; error?: string } | null>(null);
  const router = useRouter();

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await validateRollbackPreflightAction({ auditLogId: log.id });
      if (res.success) {
        setPreflight(res.data);
      } else {
        setPreflight({ valid: false, error: res.error });
      }
    } catch (err) {
      setPreflight({ valid: false, error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!confirm("Are you sure you want to revert this entity to its historical state?")) return;
    try {
      setLoading(true);
      const res = await executeRollbackAction({ auditLogId: log.id });
      if (!res.success) {
        alert(res.error || "Rollback execution failed");
      } else {
        alert(res.data.details || "Rollback successful!");
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={!log.beforeState || log.action === "ROLLBACK"}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Revert
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Atomic State Rollback</h3>
                  <p className="text-xs text-slate-500">
                    Reverting {log.entityType} ({log.entityId})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ×
              </button>
            </div>

            {/* Preflight Status Banner */}
            {loading && !preflight ? (
              <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-2 text-xs text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Validating entity existence and relational dependencies...
              </div>
            ) : preflight?.valid ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Preflight validation passed: Target record is ready for atomic rollback.
              </div>
            ) : (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center gap-2 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                Preflight Warning: {preflight?.error || "Entity cannot be reverted"}
              </div>
            )}

            {/* Side by Side Diff Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <FileJson className="w-3 h-3 text-emerald-600" /> Target Rollback State (Before)
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono h-48 overflow-auto">
                  {JSON.stringify(log.beforeState, null, 2)}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <FileJson className="w-3 h-3 text-red-600" /> Current / Overwritten State (After)
                </span>
                <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[11px] font-mono h-48 overflow-auto">
                  {JSON.stringify(log.afterState, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecute}
                disabled={loading || !preflight?.valid}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Confirm Atomic Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
