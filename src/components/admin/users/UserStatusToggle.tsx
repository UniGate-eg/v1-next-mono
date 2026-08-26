"use client";

import React, { useState } from "react";
import { UserStatus } from "../../../types/user.types";
import { setUserStatusAction } from "../../../server/actions/admin/user.admin.actions";
import { ShieldAlert, CheckCircle2, Loader2, X, AlertTriangle } from "lucide-react";

interface UserStatusToggleProps {
  userId: string;
  currentStatus: UserStatus;
  userName: string;
}

export function UserStatusToggle({ userId, currentStatus, userName }: UserStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const nextStatus: UserStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await setUserStatusAction({ userId, status: nextStatus });
      if (!res.success) {
        alert(res.error || "Failed to update user status");
      } else {
        setIsOpen(false);
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
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 active:scale-95 cursor-pointer ${
          currentStatus === "ACTIVE"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30"
        }`}
        title={`Click to ${nextStatus.toLowerCase()}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            currentStatus === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
          }`}
        />
        <span>{currentStatus}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    nextStatus === "SUSPENDED"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {nextStatus === "SUSPENDED" ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {nextStatus === "SUSPENDED" ? "Suspend Account" : "Reactivate Account"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{userName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Security Impact</span>
              </div>
              <p>
                {nextStatus === "SUSPENDED"
                  ? "Suspending this user will immediately invalidate active session tokens and terminate role authorities."
                  : "Reactivating this user will restore their sign-in privileges and re-enable assigned governance permissions."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                  nextStatus === "SUSPENDED"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                }`}
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm {nextStatus === "SUSPENDED" ? "Suspension" : "Activation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
