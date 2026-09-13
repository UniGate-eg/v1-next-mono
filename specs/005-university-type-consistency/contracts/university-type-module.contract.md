# Contract: University Type Module

**Location**: `src/lib/university-type/index.ts` (pure TypeScript, no React, no Prisma runtime import)
**Consumers**: every UI surface, `UniversityTypeBadge`, directory, majors explorer, admin form, ETL (`CatalogValidator`, `transform.ts`, `seed-excel.ts`), Zod schemas.
**Rule**: no other file in `src/` or `prisma/etl/` may define type labels, type lists, or type parsing (enforced by `tests/unit/UniversityTypeConsistency.test.ts`).

## Exports

```ts
import type { UniversityType } from "@prisma/client";

export type Lang = "en" | "ar";

export interface UniversityTypeMeta {
  en: string;      // "Public"
  ar: string;      // "حكومية"
  icon: string;    // "🏫"
}

/** Fixed display order. */
export const UNIVERSITY_TYPES: readonly UniversityType[];
// = ["PUBLIC", "PRIVATE", "NATIONAL", "INTERNATIONAL"] as const

/** Compile-time exhaustive over the Prisma enum. */
export const UNIVERSITY_TYPE_META: Readonly<Record<UniversityType, UniversityTypeMeta>>;

export function isUniversityType(value: unknown): value is UniversityType;

/** Label in the requested language; null for anything that is not a valid enum value. Never echoes raw input. */
export function getUniversityTypeLabel(type: unknown, lang: Lang): string | null;

export type ParseResult =
  | { ok: true;  type: UniversityType }
  | { ok: false; reason: "EMPTY" | "UNRECOGNISED" | "AMBIGUOUS"; candidates: UniversityType[] };

/** Free-text classifier (English/Arabic). Whole-token matching; never guesses. See research R2. */
export function parseUniversityType(raw: string | null | undefined): ParseResult;

/**
 * URL / filter param normaliser. Accepts enum values in any case, English labels, and Arabic labels.
 * Splits on commas, drops unknown values, removes duplicates, and returns them in UNIVERSITY_TYPES order.
 */
export function normalizeTypeParam(raw: string | null | undefined): UniversityType[];

/** Canonical query-string value for links: "NATIONAL" or "PUBLIC,PRIVATE". */
export function toTypeParam(types: readonly UniversityType[]): string;

/** Count per type over any list; zero-count types omitted, result in display order. */
export function countByType(items: ReadonlyArray<{ type?: unknown }>): Array<{ type: UniversityType; count: number }>;
```

## Behavioural guarantees

| ID | Guarantee |
|---|---|
| G1 | `getUniversityTypeLabel(t, lang)` is non-null for every `t ∈ UNIVERSITY_TYPES` and both languages. |
| G2 | `parseUniversityType` never returns `ok: true` when tokens for two different types are present. |
| G3 | The token `international` never contributes to `NATIONAL`, and vice versa. |
| G4 | `normalizeTypeParam` never throws, and returns `[]` for `null`, `""`, or all-unknown input. |
| G5 | `normalizeTypeParam(toTypeParam(x))` deep-equals `x` for any ordered, duplicate-free `x`. |
| G6 | All functions are pure and deterministic, with no I/O and no locale-dependent APIs. |

## Parse fixtures

These are the SC-003 reference set. Each row is a unit test case.

| # | Input | Expected |
|---|---|---|
| 1 | `International Branch` | ok INTERNATIONAL |
| 2 | `INTERNATIONAL` | ok INTERNATIONAL |
| 3 | `National` | ok NATIONAL |
| 4 | `Private, Non-profit` | ok PRIVATE |
| 5 | `Private (non-profit)` | ok PRIVATE |
| 6 | `Private Institute` | ok PRIVATE |
| 7 | `Public Research` | ok PUBLIC |
| 8 | `Public Institute` | ok PUBLIC |
| 9 | `Governmental` | ok PUBLIC |
| 10 | `جامعة أهلية` | ok NATIONAL |
| 11 | `جامعة اهلية` (no hamza) | ok NATIONAL |
| 12 | `أهلي` | ok NATIONAL |
| 13 | `خاصة` | ok PRIVATE |
| 14 | `معهد خاص` | ok PRIVATE |
| 15 | `جامعة حكومية` | ok PUBLIC |
| 16 | `دولية` | ok INTERNATIONAL |
| 17 | `branch campus` | ok INTERNATIONAL |
| 18 | `Ahleya` | ok NATIONAL |
| 19 | `  private  ` (whitespace) | ok PRIVATE |
| 20 | `""` / `null` / `undefined` | fail EMPTY |
| 21 | `Technological` | fail UNRECOGNISED |
| 22 | `Non-profit` | fail UNRECOGNISED |
| 23 | `N/A` | fail UNRECOGNISED |
| 24 | `Public-Private Partnership` | fail AMBIGUOUS [PUBLIC, PRIVATE] |
| 25 | `National / International` | fail AMBIGUOUS [NATIONAL, INTERNATIONAL] |

## normalizeTypeParam fixtures

| Input | Output |
|---|---|
| `PRIVATE` | `[PRIVATE]` |
| `private` | `[PRIVATE]` |
| `National` | `[NATIONAL]` |
| `أهلية` | `[NATIONAL]` |
| `NATIONAL,PUBLIC` | `[PUBLIC, NATIONAL]` |
| `PRIVATE,private` | `[PRIVATE]` |
| `TECHNOLOGICAL` | `[]` |
| `PRIVATE,TECHNOLOGICAL` | `[PRIVATE]` |
| `null` | `[]` |

## UniversityTypeBadge component

**Location**: `src/components/university/UniversityTypeBadge.tsx` (`"use client"`)

```ts
interface UniversityTypeBadgeProps {
  type: unknown;                 // tolerant input; validated internally
  variant?: "pill" | "inline";   // "pill" = shadcn Badge (detail page); "inline" = plain text span (card meta line, lists)
  showIcon?: boolean;            // default false
  className?: string;
}
```

- Reads `language` from `useLanguage()`.
- Renders **nothing** (`null`) when `isUniversityType(type)` is false (FR-006).
- Never renders the raw input string.
