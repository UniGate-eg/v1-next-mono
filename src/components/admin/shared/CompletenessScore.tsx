"use client";

import React from "react";

interface CompletenessScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function CompletenessScore({ score, size = "md", showLabel = true }: CompletenessScoreProps) {
  const normalizedScore = Math.min(100, Math.max(0, score || 0));

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#10b981", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (s >= 60) return { stroke: "#f59e0b", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    return { stroke: "#ef4444", bg: "bg-red-50 text-red-700 border-red-200" };
  };

  const { stroke, bg } = getColor(normalizedScore);
  const radius = size === "sm" ? 10 : size === "lg" ? 22 : 14;
  const strokeWidth = size === "sm" ? 2.5 : size === "lg" ? 4 : 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={dimension} height={dimension} className="-rotate-90">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
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
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className={`absolute text-[10px] font-bold ${normalizedScore >= 80 ? "text-emerald-700" : normalizedScore >= 60 ? "text-amber-700" : "text-red-700"}`}>
          {size !== "sm" && `${normalizedScore}%`}
        </span>
      </div>

      {showLabel && (
        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${bg}`}>
          {normalizedScore >= 80 ? "Complete" : normalizedScore >= 60 ? "Needs Info" : "Incomplete"}
        </span>
      )}
    </div>
  );
}
