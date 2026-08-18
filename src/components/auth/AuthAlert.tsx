"use client";

import React from "react";
import { AlertCircle, AlertTriangle, X } from "lucide-react";

interface AuthAlertProps {
  type?: "error" | "warning";
  message: string;
  onDismiss?: () => void;
}

export function AuthAlert({ type = "error", message, onDismiss }: AuthAlertProps) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-sm transition-all animate-in fade-in duration-200 ${
        isError
          ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
          : "bg-amber-500/10 border-amber-500/20 text-amber-200"
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <div className="flex-1 font-medium leading-relaxed">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 -mr-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
