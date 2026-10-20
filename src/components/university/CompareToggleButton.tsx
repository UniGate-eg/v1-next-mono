"use client";

import { useCompareStore } from "@/stores/compareStore";
import { Button } from "@/components/ui/button";
import { Scale, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareToggleButtonProps {
  universityId: string;
  className?: string;
  variant?: "outline" | "default" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CompareToggleButton({
  universityId,
  className,
  variant = "outline",
  size = "sm",
}: CompareToggleButtonProps) {
  // ⚡ Bolt: Selecting primitive avoids whole-store subscription, improving list performance significantly
  const isSelected = useCompareStore((state) => state.selectedIds.includes(universityId));
  const toggle = useCompareStore((state) => state.toggle);

  return (
    <Button
      variant={isSelected ? "default" : variant}
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(universityId);
      }}
      className={cn(
        "transition-all duration-200",
        isSelected && "bg-blue-600 hover:bg-blue-700 text-white",
        className
      )}
      title={isSelected ? "Remove from comparison" : "Add to comparison"}
    >
      {isSelected ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1" />
          <span>Added</span>
        </>
      ) : (
        <>
          <Scale className="h-3.5 w-3.5 mr-1" />
          <span>Compare</span>
        </>
      )}
    </Button>
  );
}
