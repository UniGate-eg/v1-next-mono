"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  requireMatchText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm Action",
  requireMatchText,
  variant = "danger",
}: ConfirmationModalProps) {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isMatchValid = !requireMatchText || inputVal.trim() === requireMatchText;

  const handleConfirm = async () => {
    if (!isMatchValid) return;
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${variant === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Please review before proceeding</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>

        {requireMatchText && (
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700">
              Type <span className="font-mono text-red-600 font-bold">{requireMatchText}</span> to confirm:
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !isMatchValid}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 ${
              variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
