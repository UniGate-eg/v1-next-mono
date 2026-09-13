# Quickstart: Verifying University Type Consistency

**Feature**: `005-university-type-consistency`

## 1. Automated checks

```bash
npx tsc --noEmit                                   # zero errors; no `| string` / `any` on type
npx vitest run tests/unit/UniversityType.test.ts   # parser, labels, URL normaliser (≥25 fixtures)
npx vitest run tests/unit/UniversityTypeConsistency.test.ts  # no label literals / phantom types outside the module
npx vitest run tests/unit/etl/                     # validator: missing enrichment, missing typeSource, rule violations
npx vitest run                                     # full suite green
```

## 2. Schema

```bash
npx prisma db push      # drops @default(PUBLIC), adds University.typeSourceRef (nullable)
npx prisma generate
```

Check: `SELECT column_default FROM information_schema.columns WHERE table_name='universities' AND column_name='type';` returns `NULL`.

## 3. Import dry run

```bash
npm run db:reset:verified -- --dry-run
```

Expect a `Type classification summary` line whose counts add up to 43, zero blocking entries once the audit is merged, and `DESCRIPTION_CONTRADICTION` warnings only for records still pending audit.

## 4. Manual cross-surface check (SC-001, SC-006)

Run `npm run dev`. For **one PRIVATE** institution (e.g. AUC) and **one NATIONAL** institution (e.g. CNU), in **English then Arabic**, confirm the badge text is identical on:

| Surface | Where |
|---|---|
| Home featured / matcher results | `/` |
| Directory card (meta line + footer pill) | `/universities` |
| Quick-view modal | click card on `/universities` |
| Detail page badge | `/universities/<slug>` |
| Majors explorer list | `/majors`, then open a major |
| Compare view | add both to compare, `/compare` |
| Bookmarks / dashboard | bookmark both, `/dashboard` |
| Admin studio + data table | `/admin/catalog` |

## 5. Filters and links (SC-004, SC-005)

| Step | Expected |
|---|---|
| Footer → "Private universities" | Directory with **Private** chip selected, only Private results |
| Click the selected chip | Filter cleared, all results, `type` param removed |
| Home → "National universities" (`?type=NATIONAL`) | **National** chip selected |
| Open `/universities?type=National` and `?type=private` | Same as canonical links |
| Open `/universities?type=TECHNOLOGICAL` | All institutions, no error, no phantom chip |
| Footer → "Public universities" (0 in catalog) | Bilingual empty state with "View all universities" |
| Type chips | Only types with ≥1 institution, each with its count; no "Public" chip while count is 0 |
| Majors explorer chips | No "Technological" chip |

## 6. Freshness (SC-007)

1. `/compare` with institution X open in another tab.
2. In `/admin/catalog`, change X's type (enter a source reference, which is required) and save.
3. Reload `/compare` and `/dashboard`: new badge shown (tag invalidation). Worst case ≤ 1 hour.
4. `/api/universities/search-index` JSON shows the new `type`.

## 7. Admin form (FR-007)

- Type select lists exactly 4 options (no "Specialized").
- Creating a university without a type is rejected with a clear message.
- Changing type without a source reference is rejected.
