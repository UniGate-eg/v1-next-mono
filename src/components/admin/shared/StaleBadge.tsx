"use client";

import React from "react";
import { Clock } from "lucide-react";
import { CompletenessScoreEngine } from "../../../server/services/CompletenessScoreEngine";

interface StaleBadgeProps {
  updatedAt: Date | string;
}

export function StaleBadge({ updatedAt }: StaleBadgeProps) {
  const isStale = CompletenessScoreEngine.isStale(updatedAt);

  if (!isStale) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200"
      title={`Last updated ${new Date(updatedAt).toLocaleDateString()} (>6 months ago)`}
    >
      <Clock className="w-3 h-3 text-amber-600" />
      Needs Annual Review
    </span>
  );
}
