# Research: University Type Consistency

**Feature**: `005-university-type-consistency` | **Date**: 2026-09-13 | **Spec**: [spec.md](spec.md)

All findings below come from reading the code on `main` at `5d2f0ab`. Every "Current state" item is a verified fact with a file reference.

---

## R0. Current-state inventory (why badges disagree)

| # | Finding | Evidence |
|---|---|---|
| 1 | Substring match classifies "International …" as NATIONAL (NATIONAL tested first; `"INTERNATIONAL".includes("NATIONAL")`). Unknown values silently become PUBLIC. | `prisma/etl/transform.ts:30-37` |
| 2 | Directory type filter uses substring match, so "NATIONAL" also matches INTERNATIONAL. | `src/app/universities/UniversitiesDirectoryClient.tsx:175-179` |
| 3 | Missing-type defaults disagree: PUBLIC in 7 places, PRIVATE in 2, `"Public Institution"` in 1. | `schema.prisma:83`, `transform.ts:31`, `UniversityCard.tsx:106`, `UniversityModal.tsx:203`, `MajorTypeFilter.tsx:45`, `MajorUniList.tsx:40,64`, `MarketingHomeClient.tsx:182`, `BilingualEnrichmentProvider.ts:595`, `seed-excel.ts:68`, `app/admin/page.tsx:37` |
| 4 | Six separate label/type lists; two add types that don't exist: `TECHNOLOGICAL` (majors) and `SPECIALIZED` (admin form; saving it would fail enum validation). | `lib/utils.ts:82`, `MajorUniList.tsx:33`, `MajorTypeFilter.tsx:6,22`, `components/university/UniversityFilters.tsx:38`, `LanguageContext.tsx:72` + `UniversitiesDirectoryClient.tsx:39,314`, `GeneralInfoTab.tsx:143-149` |
| 5 | URL casing disagrees: footer `?type=PRIVATE`, home `?type=National`, directory chips hold `"Private"`; chip selected-state check is case-sensitive. | `Footer.tsx:86-104`, `MarketingHomeClient.tsx:710`, `UniversitiesDirectoryClient.tsx:103,405` |
| 6 | Detail page badge calls `formatUniversityType(type)` without language, so it is always English. The page is a server component; language lives in client `localStorage`. | `app/universities/[slug]/page.tsx:95`, `contexts/LanguageContext.tsx:92,113` |
| 7 | Compare and dashboard pages read the committed static `public/search-index.json`. Nothing regenerates it on edit, and the `search-index` cache tag that `CacheInvalidator` revalidates is not used by anything. | `app/compare/page.tsx:14`, `app/dashboard/page.tsx:30`, `hooks/useUniversitySearch.ts:19`, `lib/cache-invalidator.ts:12,27`, `services/SearchIndexService.ts` |
| 8 | Neither source workbook has a type column. Type comes entirely from the hand-curated `VERIFIED_INSTITUTIONS_METADATA` dictionary; unmatched institutions silently get PRIVATE. | `src/data/*.xlsx` (headers: University ID, University Name, Short Name[, Notes, Certainty]); `BilingualEnrichmentProvider.ts:589-598`; `CatalogValidator.ts:157,173` |
| 9 | Shipped catalog: 24 PRIVATE, 19 NATIONAL, 0 PUBLIC, 0 INTERNATIONAL. The "Public" chip and footer Public/International links always give empty results. | `public/search-index.json` tally |
| 10 | Record contradicts itself: NU typed PRIVATE, `overviewAr` says "أول جامعة أهلية". | `BilingualEnrichmentProvider.ts:47-58` |
| 11 | Loose typing hides mismatches: `type: UniversityType \| string`, `type: any`, `(x as any).type`. | `types/university.types.ts:11`, `CatalogValidator.ts:78`, `UniversityCard.tsx:49-106` |

---

## R1. Where the single source of truth lives

- **Decision**: Add a pure, framework-free module `src/lib/university-type/` (no React, no Prisma runtime import; type-only import of `UniversityType`). It exports the ordered type list, bilingual metadata, a type guard, the free-text parser, the URL-param normaliser, and the label getter. Add one presentational `UniversityTypeBadge` client component. Every surface, the ETL, and the admin form consume only these.
- **Rationale**: The ETL runs under `tsx` outside Next.js, and client components run in the browser; a pure module works in both. Declaring the metadata as `satisfies Record<UniversityType, …>` makes a Prisma enum change a compile error until labels exist in both languages (covers SC-006 at build time).
- **Alternatives considered**:
  - *Extend `lib/utils.ts`*: rejected. It is a grab-bag (cn, cities, governorates), and parsing rules don't belong there.
  - *Store labels in `LanguageContext` translations*: rejected. The ETL can't use React context, and Title-case keys are the source of problem #5.
  - *DB lookup table for types*: rejected. The set of types is a fixed legal taxonomy, so a table adds joins and migrations for no benefit.

## R2. Free-text classification algorithm (FR-004, FR-005)

- **Decision**: Normalise the text, tokenise it, then match whole words or phrases against per-type synonym sets. Return `null` when nothing matches **or when more than one type matches** (ambiguous).
  1. Normalise: Unicode NFKC → lowercase → strip Arabic diacritics and tatweel → unify alef forms (أ إ آ → ا), ة → ه, ى → ي → replace punctuation with spaces → collapse whitespace.
  2. Synonyms (after normalisation):
     - PUBLIC: `public`, `governmental`, `government`, `state`, `حكوميه`, `حكومي`
     - PRIVATE: `private`, `خاصه`, `خاص`
     - NATIONAL: `national`, `ahleya`, `ahliya`, `ahlia`, `اهليه`, `اهلي`
     - INTERNATIONAL: `international branch`, `branch campus`, `foreign branch`, `international`, `دوليه`, `فرع`
  3. Ignore qualifier words that don't decide type: `non profit`, `nonprofit`, `research`, `institute`, `university`, `جامعه`, `معهد`, `غير ربحيه`.
  4. Match whole tokens only, so `international` can never satisfy `national`.
- **Rationale**: Whole-token matching removes the substring bug by construction. Returning null for ambiguity sends records to human review instead of guessing, which FR-005 requires. Normalisation covers masculine/feminine and hamza spelling variants in the spec's scenarios.
- **Alternatives considered**:
  - *Reorder the `includes` checks (INTERNATIONAL first)*: rejected. It fixes one case but still breaks on "Public-Private Partnership" and still guesses on unknowns.
  - *Fuzzy/ML classification*: rejected. The input set is tiny, so it would be opaque and over-engineered.
- **Reference fixtures** (SC-003, ≥20): see [contracts/university-type-module.contract.md](contracts/university-type-module.contract.md#parse-fixtures).

## R3. Missing types and database defaults (FR-005, FR-006, FR-007, SC-002)

- **Decision**:
  - Remove `@default(PUBLIC)` from `University.type` and keep the column **required** (NOT NULL). The database never holds an "unknown" type.
  - Change `IEnrichmentProvider.getEnrichment` to return `UniversityEnrichmentRecord | null`. `CatalogValidator` records a **type review entry** and a blocking error for unmatched institutions, and the reset pipeline already aborts when validation errors exist.
  - Legacy `transform.ts` / `seed-deep.ts` and `seed-excel.ts` put unclassifiable records in the review report and skip them instead of inserting.
  - The UI treats `parseUniversityType` returning `null` as "no badge" (FR-006). This is defensive, since the database guarantees a value.
- **Rationale**: Dropping a column default in Prisma via `db push` only changes future inserts, and all 43 existing rows keep their values. A required column means an empty type fails at the lowest layer, meeting SC-002 without nullable handling everywhere.
- **Alternatives considered**:
  - *Make `type` nullable*: rejected. It spreads null checks through repositories and filters and allows unclassified published records.
  - *Keep a default but log a warning*: rejected. SC-002 forbids types assigned by default.

## R4. Recording the evidence for each type (FR-017)

- **Decision**:
  - Add an optional `typeSource` object to `UniversityEnrichmentRecord`: `{ authority: "MOHE" | "SCU" | "FOREIGN_PARENT", reference: string, verifiedOn: string }`. `CatalogValidator` rejects any record without it.
  - Persist it to a new nullable DB column `University.typeSourceRef String?` (short text: authority + reference) so admins can see it.
  - When an admin changes type, `typeSourceRef` is required (Zod refinement), and the change is already captured by the existing `AuditLog` before/after state.
- **Rationale**: The verified catalog is code-reviewed in git, so the dictionary is the natural place for evidence. One nullable text column is an additive, non-breaking schema change, and it keeps evidence visible to content owners in the admin studio.
- **Alternatives considered**:
  - *Separate `TypeClassificationEvidence` table*: rejected. It is more than the need of one reference per institution.
  - *Keep evidence only in the audit document*: rejected. It isn't enforced and drifts from data.

## R5. Classification rule and data audit (FR-016, FR-018)

- **Decision** (from clarification Q1 = A): type = the institution's official **Ministry of Higher Education / Supreme Council of Universities** category (حكومية → PUBLIC, خاصة → PRIVATE, أهلية → NATIONAL). **INTERNATIONAL** is used only for branch campuses of foreign universities. Being non-profit or created by an intergovernmental agreement does not change the category.
- **Audit scope**: all 43 records in `VERIFIED_INSTITUTIONS_METADATA`. Engineering produces `specs/005-university-type-consistency/audit/type-audit.md` listing shortName, current type, MoHE category, source reference, and action. A content owner fills in the MoHE category and reference.
- **Records flagged for priority verification** (conflict or ambiguity visible in our own data; **the final category must come from the official listing, not this document**):

  | Short | Current | Why flagged |
  |---|---|---|
  | NU (Nile University) | PRIVATE | Own `overviewAr` says "أول جامعة أهلية" |
  | EJUST | PRIVATE | Intergovernmental; classified differently from UFE |
  | UFE (Université Française d'Égypte) | NATIONAL | Intergovernmental; classified differently from EJUST |
  | AIU (Alamein International University) | NATIONAL | "International" in name; confirm it is أهلية, not a branch campus |
  | GU (Galala), NMU (New Mansoura) | NATIONAL | Not "… National University" by name; confirm category |
  | GIU, MIU | PRIVATE | "International" in name; confirm not a foreign branch |

- **Rationale**: Option A makes every badge checkable against a public source, and the review table makes each change traceable (SC-008).
- **Alternatives considered**: Options B and C from clarification, both rejected by the product owner.

## R6. Filter URL contract (FR-009 – FR-014)

- **Decision**: The canonical query value is the **UPPERCASE enum** (`?type=PUBLIC|PRIVATE|NATIONAL|INTERNATIONAL`), comma-separated for multiple values.
  - The directory normalises incoming values with the module's `normalizeTypeParam` (case-insensitive, also accepts Arabic labels) and drops unknown values without error.
  - Directory filter state is `UniversityType[]`, chips carry enum values, and selected state and matching are exact enum equality.
  - Chips are built from per-type counts over the loaded catalog, and zero-count types are hidden.
  - When the URL requests only zero-count types, show a bilingual empty state with a "View all universities" action.
  - Home page link changes from `?type=National` to `?type=NATIONAL`.
- **Rationale**: UPPERCASE already matches the footer, `components/university/UniversityFilters.tsx`, the repository `findMany` filter and Prisma, so the fewest links change. Tolerant parsing keeps shared or indexed links working.
- **Alternatives considered**:
  - *Lowercase slugs (`?type=national`)*: rejected. It changes more call sites and needs a mapping layer to the enum anyway.
  - *Show disabled zero-count chips*: rejected per spec assumption, which follows the majors explorer's existing behaviour.

## R7. Arabic label on server-rendered detail page (FR-003)

- **Decision**: Replace the server-side `formatUniversityType(type)` call with the client `UniversityTypeBadge`. It reads `useLanguage()` and renders inside the existing shadcn `Badge`.
- **Rationale**: Language is stored in client `localStorage` and is invisible to the server. Every other bilingual element on the site already switches client-side, so this matches existing behaviour, including the brief first-paint language switch.
- **Alternatives considered**: *Move language to a cookie so the server can render Arabic*: rejected as out of scope. It's a site-wide i18n change and belongs in its own feature.

## R8. One fresh catalog for all surfaces (FR-015, SC-007)

- **Decision**:
  - Add route handler `GET /api/universities/search-index` that returns `universityRepository.findForSearch()`, wrapped in `unstable_cache` with `revalidate: 3600` and tags `["universities", "universities-list", "search-index"]`.
  - `useUniversitySearch` fetches this route instead of `/search-index.json`.
  - Server pages keep `public/search-index.json` only as the existing DB-outage fallback.
- **Rationale**:
  - Both invalidators already emit these tags: `NextCacheInvalidationService` emits `universities`, and `CacheInvalidator` (admin edits) emits `universities-list` and `search-index`. Admin and ETL changes therefore reach compare and dashboard immediately, with a 1-hour upper bound.
  - The Next.js version is `^15.1.7` without Cache Components enabled, so `unstable_cache` is the supported primitive. Moving to `"use cache"` is deferred to a Next 16 upgrade.
- **Alternatives considered**:
  - *Regenerate the static JSON in `prebuild`*: rejected. It is only as fresh as the last deploy, so admin edits would stay invisible until redeploy.
  - *Pass server data into compare/dashboard as props*: rejected. Both are client pages driven by URL and bookmarks, and would need restructuring beyond scope.
- **Note**: the payload includes faculties and programs (same as today's static file). Payload slimming is out of scope.

## R9. Test strategy

- **Decision**:
  - Vitest unit tests (existing `vitest.config.ts`, node env, `tests/unit/`) for the module: parse fixtures (≥20), normaliser, label completeness across enum × language, and URL normalisation.
  - Extend `tests/unit/etl/validator.test.ts` for missing enrichment and missing `typeSource` → review entry + blocking error.
  - Add `tests/unit/UniversityTypeConsistency.test.ts`: a static guard test that fails if `src/` contains type label literals (`"حكومية"`, `"أهلية"`, `"خاصة"`, `"دولية"`) or `TECHNOLOGICAL` / `SPECIALIZED` outside `src/lib/university-type/`.
  - `npx tsc --noEmit` must pass after removing the `| string` / `any` type escapes.
- **Rationale**: No component-test tooling exists (no jsdom / Testing Library), and adding it is out of scope. The guard test plus the `satisfies` compile check enforce "one definition" (SC-001) structurally, and manual cross-surface checks are in [quickstart.md](quickstart.md).
- **Alternatives considered**: *Add Playwright E2E*: deferred. It would be the ideal cross-surface check for SC-001, but it's new infrastructure.
