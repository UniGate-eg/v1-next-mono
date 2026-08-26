"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error Boundary Caught]", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">An Operational Error Occurred</h3>
        <p className="text-xs text-slate-500 mt-1">{error.message || "An unexpected error occurred in the administrative panel."}</p>
      </div>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Try Again
      </button>
    </div>
  );
}
