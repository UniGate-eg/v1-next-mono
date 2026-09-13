"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  isUniversityType,
  getUniversityTypeLabel,
  UNIVERSITY_TYPE_META,
  type UniversityType,
} from "@/lib/university-type";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface UniversityTypeBadgeProps {
  type: unknown;
  variant?: "pill" | "inline";
  showIcon?: boolean;
  className?: string;
}

const BADGE_VARIANTS: Record<UniversityType, "public" | "private" | "national" | "international"> = {
  PUBLIC: "public",
  PRIVATE: "private",
  NATIONAL: "national",
  INTERNATIONAL: "international",
};

export function UniversityTypeBadge({
  type,
  variant = "pill",
  showIcon = true,
  className,
}: UniversityTypeBadgeProps) {
  const { language } = useLanguage();

  if (!isUniversityType(type)) {
    return null;
  }

  const label = getUniversityTypeLabel(type, language);
  if (!label) {
    return null;
  }

  const icon = UNIVERSITY_TYPE_META[type].icon;

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        {showIcon && <span aria-hidden="true">{icon}</span>}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Badge
      variant={BADGE_VARIANTS[type] || "secondary"}
      className={cn("font-medium inline-flex items-center gap-1.5", className)}
    >
      {showIcon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </Badge>
  );
}
