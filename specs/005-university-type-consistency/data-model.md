# Data Model: University Type Consistency

**Feature**: `005-university-type-consistency` | **Date**: 2026-09-13

## 1. UniversityType (enum — unchanged values)

| Value | EN label | AR label | Icon | Definition (FR-016) |
|---|---|---|---|---|
| `PUBLIC` | Public | حكومية | 🏫 | MoHE category حكومية |
| `PRIVATE` | Private | خاصة | 🔒 | MoHE category خاصة |
| `NATIONAL` | National | أهلية | 🏛️ | MoHE category أهلية |
| `INTERNATIONAL` | International | دولية | 🌍 | Branch campus of a foreign university only |

- Display order is fixed: PUBLIC, PRIVATE, NATIONAL, INTERNATIONAL.
- `TECHNOLOGICAL` (majors UI) and `SPECIALIZED` (admin form) are **removed**. They were never enum values.
- Code source of truth: `UNIVERSITY_TYPE_META` in `src/lib/university-type/`, declared `satisfies Record<UniversityType, UniversityTypeMeta>`.

## 2. University (Prisma model — changes)

| Field | Before | After | Notes |
|---|---|---|---|
| `type` | `UniversityType @default(PUBLIC)` | `UniversityType` (required, **no default**) | Every create must set it explicitly. Existing rows are unaffected. |
| `typeSourceRef` | — | `String?` | **New.** Evidence for the classification, e.g. `MOHE: <listing title/URL> (verified 2026-09-20)`. Required by app validation when an admin **changes** `type`, and required by import for verified-catalog records. |

The `@@index([type])` index is unchanged.

**Migration**: additive and non-destructive, applied with the project's `prisma db push` workflow. It drops a column default and adds one nullable column, with no data rewrite. The audit corrections (§5) are applied afterwards through the verified-catalog reset pipeline.

## 3. UniversityEnrichmentRecord (ETL — changes)

`src/server/etl/interfaces/IEnrichmentProvider.ts`

```text
UniversityEnrichmentRecord
  … existing fields …
  type:        UniversityType                       (required, unchanged)
  typeSource:  TypeSource                           (NEW, required for verified catalog)

TypeSource
  authority:   "MOHE" | "SCU" | "FOREIGN_PARENT"    (FOREIGN_PARENT only valid when type = INTERNATIONAL)
  reference:   string (non-empty)                   (listing name, decree no., or URL)
  verifiedOn:  ISO date string (YYYY-MM-DD)

IEnrichmentProvider.getEnrichment(shortName, nameEn): UniversityEnrichmentRecord | null   (was: never null, PRIVATE fallback)
```

**Validation rules** (enforced in `CatalogValidator`):
- V1: No enrichment record → `TypeReviewEntry{reason: "NO_VERIFIED_RECORD"}` + blocking error.
- V2: `typeSource` missing, or `reference` empty → `TypeReviewEntry{reason: "MISSING_SOURCE"}` + blocking error.
- V3: `authority = FOREIGN_PARENT` while `type ≠ INTERNATIONAL`, or `type = INTERNATIONAL` while authority ≠ FOREIGN_PARENT → `TypeReviewEntry{reason: "RULE_VIOLATION"}` + blocking error.
- V4 (FR-018, warning, non-blocking): `overviewAr` contains a type term (after normalisation) that `parseUniversityType` maps to a type different from `type` → `TypeReviewEntry{reason: "DESCRIPTION_CONTRADICTION"}`. Becomes blocking once the audit (§5) is complete.

## 4. TypeReviewEntry (new, transient — import report only, not persisted)

| Field | Type | Description |
|---|---|---|
| `institutionId` | string | Source University ID or shortName |
| `nameEn` | string | Institution name |
| `originalValue` | string \| null | Raw type text (legacy importers) or `null` (dictionary-driven import) |
| `reason` | `"UNRECOGNISED" \| "AMBIGUOUS" \| "EMPTY" \| "NO_VERIFIED_RECORD" \| "MISSING_SOURCE" \| "RULE_VIOLATION" \| "DESCRIPTION_CONTRADICTION"` | Why human review is needed |
| `candidates` | UniversityType[] | Types matched (for `AMBIGUOUS`), otherwise empty |
| `blocking` | boolean | Whether it prevents the import from committing |

This entry is added to `ValidationReport` as `typeReview: TypeReviewEntry[]` and `typeCounts: Record<UniversityType, number>` (FR-008). The format is in [contracts/import-review-report.contract.md](contracts/import-review-report.contract.md).

## 5. TypeAuditRow (documentation artefact — `audit/type-audit.md`)

| Field | Description |
|---|---|
| shortName | Dictionary key |
| nameEn / nameAr | Institution names |
| currentType | Value on `main` before the audit |
| moheCategory | حكومية / خاصة / أهلية / foreign branch (filled by content owner) |
| resolvedType | Type under the FR-016 rule |
| sourceRef | Becomes `typeSource.reference` |
| action | `NO_CHANGE` / `CHANGE_TYPE` / `FIX_DESCRIPTION` |

## 6. Client-side types (changes)

| Type | Before | After |
|---|---|---|
| `UniversityDTO.type` / `SlimSearchToken.type` (`src/types/university.types.ts`) | `UniversityType \| string` | `UniversityType` |
| `ValidatedUniversity.type` (`CatalogValidator.ts`) | `any` | `UniversityType` |
| `ValidatedUniversity.typeSourceRef` | — | `string` |
| Directory `activeFilters.type` | `string[]` (Title-case labels) | `UniversityType[]` |
| `MajorTypeFilter` `TypeFilter` | `"ALL" \| …5 incl. TECHNOLOGICAL` | `"ALL" \| UniversityType` |

## 7. State transitions

The type has no lifecycle states. The only transition is **admin change of type**:

```text
[type = X, typeSourceRef = r1]
   └─ admin saves type = Y (Y ≠ X) with typeSourceRef = r2 (required, non-empty)
        → DB update → AuditLog(before: {type: X, typeSourceRef: r1}, after: {type: Y, typeSourceRef: r2})
        → CacheInvalidator.invalidateUniversity(slug)  (tags: universities-list, search-index, university-<slug>)
        → all surfaces show Y within ≤ 1h (normally on next request)
```
