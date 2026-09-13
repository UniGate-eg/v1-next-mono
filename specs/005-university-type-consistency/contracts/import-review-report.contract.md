# Contract: Import Type Review Report

**Producers**: `CatalogValidator.validate()` (verified-catalog reset, `npm run db:reset:verified`); legacy importers `prisma/etl/transform.ts` (via `seed-deep.ts`) and `prisma/etl/seed-excel.ts`.

## ValidationReport additions

```ts
interface ValidationReport {
  success: boolean;               // existing — now also false when any typeReview entry is blocking
  errors: string[];               // existing — one line per blocking type review entry is appended
  // … existing fields …
  typeCounts: Record<UniversityType, number>;   // NEW (FR-008), classified records only
  typeReview: TypeReviewEntry[];                // NEW (FR-005), see data-model.md §4
}
```

## CLI output (reset-verified-catalog.ts, structured logger)

After validation, and also on `--dry-run`, the script prints one JSON line:

```json
{"level":"INFO","step":"CatalogValidator","message":"Type classification summary",
 "typeCounts":{"PUBLIC":0,"PRIVATE":23,"NATIONAL":20,"INTERNATIONAL":0},
 "reviewCount":1,"blockingReviewCount":0}
```

It then prints one line per review entry:

```json
{"level":"WARN","step":"CatalogValidator","message":"Type review required",
 "institutionId":"NU","nameEn":"Nile University","originalValue":null,
 "reason":"DESCRIPTION_CONTRADICTION","candidates":["NATIONAL"],"blocking":false}
```

(Counts above are illustrative. Real values depend on the audit.)

## Legacy importers

- Write each entry as a JSON line to `prisma/etl/etl-errors.jsonl` with `"kind":"TYPE_REVIEW"` (existing error sink).
- Skip the record (do not insert it) when the entry is blocking.
- Print the same summary line at the end of the run.

## Exit behaviour

| Condition | reset-verified-catalog | Legacy importers |
|---|---|---|
| No blocking entries | Proceeds as today | Proceeds; blocking records skipped |
| ≥1 blocking entry | Aborts before any DB mutation (existing "Validation failed — pipeline aborted" path) | Completes other records; exits `0` with a non-zero `blockingReviewCount` in summary |
