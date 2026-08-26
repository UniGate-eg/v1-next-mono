"use client";

import React from "react";
import { AlertCircle, Clock } from "lucide-react";
import { CompletenessScoreEngine } from "../../../server/services/CompletenessScoreEngine";

interface StaleBadgeProps {
  updatedAt: Date | string;
}

export function StaleBadge({ updatedAt }: StaleBadgeProps) {
  const isStale = CompletenessScoreEngine.isStale(updatedAt);

  if (!isStale) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs"
      title="Record has not been modified in >6 months. Annual verification recommended."
    >
      <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
      Needs Annual Review
    </span>
  );
}
