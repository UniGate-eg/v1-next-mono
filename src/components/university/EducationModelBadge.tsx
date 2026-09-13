"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  isEducationModel,
  getEducationModelLabel,
  EDUCATION_MODEL_META,
  type EducationModel,
} from "@/lib/education-model";
import { cn } from "@/lib/utils";

export interface EducationModelBadgeProps {
  model: unknown;
  variant?: "pill" | "inline";
  showIcon?: boolean;
  className?: string;
}

export function EducationModelBadge({
  model,
  variant = "inline",
  showIcon = true,
  className,
}: EducationModelBadgeProps) {
  const { language } = useLanguage();

  if (!isEducationModel(model)) {
    return null;
  }

  const label = getEducationModelLabel(model, language);
  if (!label) {
    return null;
  }

  const icon = EDUCATION_MODEL_META[model as EducationModel].icon;

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
          className
        )}
      >
        {showIcon && <span aria-hidden="true">{icon}</span>}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {showIcon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
