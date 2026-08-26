"use client";

import React from "react";

interface CompletenessScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CompletenessScore({
  score,
  size = "md",
  showLabel = true,
}: CompletenessScoreProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));

  // Color config based on health
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#10B981", bg: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Complete" };
    if (s >= 50) return { stroke: "#F59E0B", bg: "text-amber-600 bg-amber-50 border-amber-200", label: "Incomplete" };
    return { stroke: "#EF4444", bg: "text-rose-600 bg-rose-50 border-rose-200", label: "Critical" };
  };

  const { stroke, bg, label } = getColor(clamped);

  const radius = size === "sm" ? 14 : size === "lg" ? 28 : 20;
  const strokeWidth = size === "sm" ? 3 : size === "lg" ? 5 : 4;
  const dimension = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-2.5 select-none" title={`Profile Quality: ${clamped}% (${label})`}>
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg className="transform -rotate-90" width={dimension} height={dimension}>
          {/* Background circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className={`absolute font-bold text-slate-900 ${
            size === "sm" ? "text-[9px]" : size === "lg" ? "text-xs" : "text-[10px]"
          }`}
        >
          {clamped}%
        </span>
      </div>

      {showLabel && (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${bg}`}>
          {label}
        </span>
      )}
    </div>
  );
}
