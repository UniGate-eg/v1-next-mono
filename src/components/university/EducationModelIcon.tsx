import React from "react";
import { EgyptFlag } from "@/components/ui/EgyptFlag";
import { getEducationModelIcon } from "@/lib/education-model";
import { cn } from "@/lib/utils";

export interface EducationModelIconProps {
  model: unknown;
  className?: string;
}

/**
 * Renders the icon for an education model.
 *
 * The Egyptian model's icon is the 🇪🇬 flag emoji (a "regional indicator" glyph),
 * which many platforms — Windows most notably — do not render as a flag at all;
 * they show the literal letters "EG" instead. Every other model's icon is a plain
 * emoji with universal font support, so only Egyptian needs special handling: it
 * renders the repo's own SVG flag (used identically on the marketing home page)
 * instead of the emoji character.
 */
export function EducationModelIcon({ model, className }: EducationModelIconProps) {
  if (model === "EGYPTIAN") {
    return (
      <EgyptFlag
        className={cn("w-4 h-3 rounded-[1px] inline-block shrink-0 align-[-1px]", className)}
      />
    );
  }

  const icon = getEducationModelIcon(model);
  if (!icon) return null;

  return <span aria-hidden="true">{icon}</span>;
}
