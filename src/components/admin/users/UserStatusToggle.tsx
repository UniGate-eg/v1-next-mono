"use client";

import React, { useState } from "react";
import { UserStatus } from "../../../types/user.types";
import { setUserStatusAction } from "../../../server/actions/admin/user.admin.actions";
import { ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";

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
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
          currentStatus === "ACTIVE"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        }`}
      >
        {currentStatus}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${nextStatus === "SUSPENDED" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                {nextStatus === "SUSPENDED" ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {nextStatus === "SUSPENDED" ? "Suspend User Account" : "Activate User Account"}
                </h3>
                <p className="text-xs text-slate-500">{userName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {nextStatus === "SUSPENDED"
                ? "Suspending this user will immediately revoke their administrative session and block all subsequent requests."
                : "Activating this user will restore their ability to log in and exercise assigned role permissions."}
            </p>

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
                onClick={handleToggle}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors ${
                  nextStatus === "SUSPENDED"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
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
