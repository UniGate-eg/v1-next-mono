import type { EducationModel } from "@prisma/client";
export type { EducationModel };

export type Lang = "en" | "ar";

export interface EducationModelMeta {
  en: string;
  ar: string;
  icon: string;
}

/** Fixed display order, matching the Prisma enum. */
export const EDUCATION_MODELS = [
  "AMERICAN",
  "GERMAN",
  "BRITISH",
  "EGYPTIAN",
  "FRENCH",
  "CANADIAN",
] as const;

/** Single source of truth for education-model labels and icons. Compile-time exhaustive over the Prisma enum. */
export const EDUCATION_MODEL_META: Readonly<Record<EducationModel, EducationModelMeta>> = {
  AMERICAN: { en: "American", ar: "أمريكي", icon: "🎓" },
  GERMAN: { en: "German", ar: "ألماني", icon: "🦅" },
  BRITISH: { en: "British", ar: "بريطاني", icon: "🎩" },
  EGYPTIAN: { en: "Egyptian", ar: "مصري", icon: "🇪🇬" },
  FRENCH: { en: "French", ar: "فرنسي", icon: "🗼" },
  CANADIAN: { en: "Canadian", ar: "كندي", icon: "🍁" },
} as const;

export function isEducationModel(value: unknown): value is EducationModel {
  return typeof value === "string" && (EDUCATION_MODELS as readonly string[]).includes(value);
}

/** Label in the requested language; null for anything that is not a valid enum value. Never echoes raw input. */
export function getEducationModelLabel(model: unknown, lang: Lang): string | null {
  if (!isEducationModel(model)) {
    return null;
  }
  return EDUCATION_MODEL_META[model][lang] ?? null;
}

/** Icon for the model; null for anything that is not a valid enum value. */
export function getEducationModelIcon(model: unknown): string | null {
  if (!isEducationModel(model)) {
    return null;
  }
  return EDUCATION_MODEL_META[model].icon;
}

/** Count per model over any list; zero-count models omitted, result in display order. */
export function countByEducationModel(
  items: ReadonlyArray<{ educationModel?: unknown }>
): Array<{ model: EducationModel; count: number }> {
  const counts: Record<EducationModel, number> = {
    AMERICAN: 0,
    GERMAN: 0,
    BRITISH: 0,
    EGYPTIAN: 0,
    FRENCH: 0,
    CANADIAN: 0,
  };

  for (const item of items) {
    if (isEducationModel(item?.educationModel)) {
      counts[item.educationModel]++;
    }
  }

  const result: Array<{ model: EducationModel; count: number }> = [];
  for (const model of EDUCATION_MODELS) {
    if (counts[model] > 0) {
      result.push({ model, count: counts[model] });
    }
  }

  return result;
}
