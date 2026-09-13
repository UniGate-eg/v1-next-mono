import type { UniversityType } from "@prisma/client";
export type { UniversityType };

export type Lang = "en" | "ar";

export interface UniversityTypeMeta {
  en: string;
  ar: string;
  icon: string;
}

/** Fixed display order. */
export const UNIVERSITY_TYPES = [
  "PUBLIC",
  "PRIVATE",
  "NATIONAL",
  "INTERNATIONAL",
] as const;

/** Compile-time exhaustive over the Prisma enum. */
export const UNIVERSITY_TYPE_META: Readonly<Record<UniversityType, UniversityTypeMeta>> = {
  PUBLIC: { en: "Public", ar: "حكومية", icon: "🏫" },
  PRIVATE: { en: "Private", ar: "خاصة", icon: "🔒" },
  NATIONAL: { en: "National", ar: "أهلية", icon: "🏛️" },
  INTERNATIONAL: { en: "International", ar: "دولية", icon: "🌍" },
} as const;

export function isUniversityType(value: unknown): value is UniversityType {
  return typeof value === "string" && UNIVERSITY_TYPES.includes(value as UniversityType);
}

/** Label in the requested language; null for anything that is not a valid enum value. Never echoes raw input. */
export function getUniversityTypeLabel(type: unknown, lang: Lang): string | null {
  if (!isUniversityType(type)) {
    return null;
  }
  return UNIVERSITY_TYPE_META[type][lang] ?? null;
}

/** Icon for the type; null for anything that is not a valid enum value. */
export function getUniversityTypeIcon(type: unknown): string | null {
  if (!isUniversityType(type)) {
    return null;
  }
  return UNIVERSITY_TYPE_META[type].icon;
}

export type ParseResult =
  | { ok: true; type: UniversityType }
  | { ok: false; reason: "EMPTY" | "UNRECOGNISED" | "AMBIGUOUS"; candidates: UniversityType[] };

function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel) and tatweel
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    // Unify alef forms
    .replace(/[أإآٱ]/g, "ا")
    // Unify ta marbuta to ha and alif maqsura to ya
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    // Replace punctuation and symbols with space
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const PHRASE_SYNONYMS: Record<UniversityType, string[]> = {
  INTERNATIONAL: ["international branch", "branch campus", "foreign branch"],
  PUBLIC: ["public research", "public institute"],
  PRIVATE: ["private institute", "private non profit"],
  NATIONAL: [],
};

const TOKEN_SYNONYMS: Record<UniversityType, string[]> = {
  PUBLIC: ["public", "governmental", "government", "state", "حكوميه", "حكومي"],
  PRIVATE: ["private", "خاصه", "خاص"],
  NATIONAL: ["national", "ahleya", "ahliya", "ahlia", "اهليه", "اهلي"],
  INTERNATIONAL: ["international", "دوليه", "فرع"],
};

/** Free-text classifier (English/Arabic). Whole-token matching; never guesses. */
export function parseUniversityType(raw: string | null | undefined): ParseResult {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { ok: false, reason: "EMPTY", candidates: [] };
  }

  const normalized = normalizeText(raw);
  if (!normalized) {
    return { ok: false, reason: "EMPTY", candidates: [] };
  }

  const matched = new Set<UniversityType>();

  // Check multi-word phrases first
  for (const type of UNIVERSITY_TYPES) {
    for (const phrase of PHRASE_SYNONYMS[type]) {
      const phraseRegex = new RegExp(`(^|\\s)${phrase}(\\s|$)`, "i");
      if (phraseRegex.test(normalized)) {
        matched.add(type);
      }
    }
  }

  // Tokenize words
  const tokens = normalized.split(/\s+/);
  for (const token of tokens) {
    const variants = [token];
    // In Arabic, words with conjunction waw prefix (و) e.g. وخاص, وحكومي
    if (token.startsWith("و") && token.length > 2) {
      variants.push(token.slice(1));
    }

    for (const variant of variants) {
      for (const type of UNIVERSITY_TYPES) {
        if (TOKEN_SYNONYMS[type].includes(variant)) {
          matched.add(type);
        }
      }
    }
  }

  const candidates = UNIVERSITY_TYPES.filter((t) => matched.has(t));

  if (candidates.length === 1) {
    return { ok: true, type: candidates[0] };
  }
  if (candidates.length > 1) {
    return { ok: false, reason: "AMBIGUOUS", candidates };
  }
  return { ok: false, reason: "UNRECOGNISED", candidates: [] };
}

/**
 * URL / filter param normaliser. Accepts enum values in any case, English labels, and Arabic labels.
 * Splits on commas, drops unknown values, removes duplicates, and returns them in UNIVERSITY_TYPES order.
 */
export function normalizeTypeParam(raw: string | null | undefined): UniversityType[] {
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  const pieces = raw.split(",").map((p) => p.trim()).filter(Boolean);
  const matched = new Set<UniversityType>();

  for (const piece of pieces) {
    const upper = piece.toUpperCase();
    if (isUniversityType(upper)) {
      matched.add(upper);
      continue;
    }

    const norm = normalizeText(piece);
    for (const type of UNIVERSITY_TYPES) {
      const meta = UNIVERSITY_TYPE_META[type];
      if (
        norm === normalizeText(meta.en) ||
        norm === normalizeText(meta.ar) ||
        TOKEN_SYNONYMS[type].includes(norm)
      ) {
        matched.add(type);
        break;
      }
    }
  }

  return UNIVERSITY_TYPES.filter((t) => matched.has(t));
}

/** Canonical query-string value for links: "NATIONAL" or "PUBLIC,PRIVATE". */
export function toTypeParam(types: UniversityType | readonly UniversityType[]): string {
  const arr = Array.isArray(types) ? types : [types];
  if (!arr || !arr.length) {
    return "";
  }
  const ordered = UNIVERSITY_TYPES.filter((t) => arr.includes(t));
  return ordered.join(",");
}

/** Count per type over any list; zero-count types omitted, result in display order. */
export function countByType(
  items: ReadonlyArray<{ type?: unknown }>
): Array<{ type: UniversityType; count: number }> {
  const counts: Record<UniversityType, number> = {
    PUBLIC: 0,
    PRIVATE: 0,
    NATIONAL: 0,
    INTERNATIONAL: 0,
  };

  for (const item of items) {
    if (isUniversityType(item?.type)) {
      counts[item.type]++;
    }
  }

  const result: Array<{ type: UniversityType; count: number }> = [];
  for (const type of UNIVERSITY_TYPES) {
    if (counts[type] > 0) {
      result.push({ type, count: counts[type] });
    }
  }

  return result;
}
