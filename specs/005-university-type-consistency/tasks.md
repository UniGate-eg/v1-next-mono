# Tasks: University Type Consistency

**Input**: Design documents from `/specs/005-university-type-consistency/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Unit tests, fixture test cases, and consistency guard tests are included as specified in the plan and contract requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`)
- Exact file paths are included in every task description

## Path Conventions

- Next.js full-stack web application: `src/` (client components, hooks, lib, contexts, schemas, types, server services/repositories), `prisma/` (schema, ETL scripts), `tests/unit/` (Vitest test suite), and `specs/005-university-type-consistency/` (spec documentation and audit artifacts).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure preparation.

- [X] T001 Create directory structure for university type domain module and audit artifacts in `src/lib/university-type/` and `specs/005-university-type-consistency/audit/`
- [X] T002 [P] Verify baseline test suite and TypeScript checking with `npx vitest run` and `npx tsc --noEmit`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain module, badge component, and static guard tests that MUST be complete before user stories can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Implement pure university type domain module in `src/lib/university-type/index.ts` with `UNIVERSITY_TYPES`, `UNIVERSITY_TYPE_META`, `isUniversityType`, `getUniversityTypeLabel`, `parseUniversityType`, `normalizeTypeParam`, `toTypeParam`, and `countByType`
- [X] T004 [P] Create unit tests for module API, guarantees G1–G6, and >=25 parse and normalisation fixtures in `tests/unit/UniversityType.test.ts`
- [X] T005 [P] Implement client-side `UniversityTypeBadge` component supporting `pill` and `inline` variants with language context in `src/components/university/UniversityTypeBadge.tsx`
- [X] T006 [P] Create static consistency guard test in `tests/unit/UniversityTypeConsistency.test.ts` to disallow hardcoded type labels or phantom types outside `src/lib/university-type/`

**Checkpoint**: Foundation ready - all core type utilities, badge component, and guard tests are in place.

---

## Phase 3: User Story 1 - Same institution, same badge, everywhere (Priority: P1) 🎯 MVP

**Goal**: The institution type badge is identical in wording, icon, and meaning across all 8 user-facing and admin surfaces in both English and Arabic, and client surfaces consume a single tag-invalidated catalog endpoint.

**Independent Test**: Pick any institution (e.g. AUC for Private, CNU for National), visit all surfaces (home, directory, modal, detail page, majors list, compare, bookmarks, admin studio/table), and confirm identical badge text and icon; change a type in admin and confirm update propagation via `/api/universities/search-index`.

### Implementation for User Story 1

- [X] T007 [P] [US1] Remove deprecated `UNIVERSITY_TYPE_MAP` and `formatUniversityType` from `src/lib/utils.ts`
- [X] T008 [P] [US1] Tighten type definitions by removing `| string` and `any` from `type` fields in `src/types/university.types.ts`
- [X] T009 [P] [US1] Replace type label rendering and remove `"PUBLIC"` fallback with `UniversityTypeBadge` in `src/components/university/UniversityCard.tsx`
- [X] T010 [P] [US1] Replace type label rendering and remove `"PUBLIC"` fallback with `UniversityTypeBadge` in `src/components/university/UniversityModal.tsx`
- [X] T011 [P] [US1] Update `src/components/dashboard/BookmarkCard.tsx` to render type with `UniversityTypeBadge`
- [X] T012 [P] [US1] Update `src/app/compare/page.tsx` to use `getUniversityTypeLabel` from `src/lib/university-type/index.ts`
- [X] T013 [P] [US1] Update `src/app/majors/components/MajorUniList.tsx` to use `UniversityTypeBadge` and remove local `typeMap` and `"PUBLIC"` fallback
- [X] T014 [P] [US1] Update `src/app/(marketing)/MarketingHomeClient.tsx` to use `UniversityTypeBadge` and remove `"PUBLIC"` fallback
- [X] T015 [P] [US1] Update `src/components/admin/UniversityDataTable.tsx` and `src/components/admin/AdminDashboardView.tsx` to use `getUniversityTypeLabel` from `src/lib/university-type/index.ts`
- [X] T016 [P] [US1] Update `src/app/admin/page.tsx` to remove `"Public Institution"` fallback and use `getUniversityTypeLabel`
- [X] T017 [P] [US1] Create cached catalog endpoint route in `src/app/api/universities/search-index/route.ts` with `unstable_cache` tags `["universities", "universities-list", "search-index"]`
- [X] T018 [US1] Update `src/hooks/useUniversitySearch.ts` to fetch `/api/universities/search-index` instead of `/search-index.json` (depends on T017)

**Checkpoint**: User Story 1 is functional and testable independently — badges are consistent across all surfaces and backed by the fresh search index endpoint.

---

## Phase 4: User Story 2 - Imported data is classified correctly or flagged (Priority: P1)

**Goal**: Free-text type values in English/Arabic are classified without substring bugs, missing/unrecognized types fail into an import review report without default assignments, and admin mutations require source evidence.

**Independent Test**: Run import/reset with test data containing known and unknown types; verify `typeCounts` summary and `typeReview` report in structured logs and confirm blocking errors abort mutations.

### Implementation for User Story 2

- [X] T019 [P] [US2] Update `prisma/schema.prisma` to remove `@default(PUBLIC)` from `University.type` and add `typeSourceRef String?`
- [X] T020 [P] [US2] Update `src/server/etl/interfaces/IEnrichmentProvider.ts` to define `TypeSource` interface, add `typeSource` to `UniversityEnrichmentRecord`, and update `getEnrichment` to return `UniversityEnrichmentRecord | null`
- [X] T021 [US2] Update `src/server/etl/CatalogValidator.ts` to implement validation rules V1–V4, collect `typeCounts` and `typeReview` entries, and type `ValidatedUniversity.type` as `UniversityType` and `typeSourceRef` (depends on T020)
- [X] T022 [P] [US2] Update validator unit tests in `tests/unit/etl/validator.test.ts` for V1–V4 rules, missing enrichment, missing source, and review report output
- [X] T023 [P] [US2] Update `prisma/etl/transform.ts` and `prisma/etl/seed-deep.ts` to use `parseUniversityType`, record review entries, and skip on failure
- [X] T024 [P] [US2] Update `prisma/etl/seed-excel.ts` to remove `"PRIVATE"` fallback create and record review entries instead
- [X] T025 [US2] Update `prisma/etl/reset-verified-catalog.ts` to output structured JSON logs for `typeCounts` and `typeReview` per import review report contract (depends on T021)
- [X] T026 [P] [US2] Update `src/server/repositories/PostgresUniversityRepository.ts` to persist `typeSourceRef` and drop `as any` on `type`
- [X] T027 [P] [US2] Update `src/schemas/university.schema.ts` to validate `UNIVERSITY_TYPES` enum and require `typeSourceRef` when `type` changes
- [X] T028 [P] [US2] Update `src/components/admin/university-studio/tabs/GeneralInfoTab.tsx` and `src/components/admin/university-studio/UniversityStudio.tsx` to show 4 module types (remove `SPECIALIZED`) and add `typeSourceRef` input
- [X] T029 [US2] Update `src/server/services/AdminUniversityService.ts` to require `typeSourceRef` on type change and record in `AuditLog` (depends on T027)

**Checkpoint**: User Story 2 is functional and testable independently — import pipeline safely classifies or reviews records with zero default guessing.

---

## Phase 5: User Story 3 - Type filters behave predictably (Priority: P2)

**Goal**: Filter URL casing is tolerant (`?type=National`, `?type=private`, `?type=أهلية`), matching uses exact enum values, chips reflect counts from loaded catalog (hiding 0-count types), and zero-count target links show a bilingual empty state.

**Independent Test**: Navigate to `/universities` via footer links ("Private universities", "Public universities"), home links (`?type=NATIONAL`), and casing variants; test single-click chip removal, multi-select, and empty state action.

### Implementation for User Story 3

- [X] T030 [P] [US3] Update `src/components/university/UniversityFilters.tsx` to read filter options from `src/lib/university-type/index.ts`
- [X] T031 [US3] Update `src/app/universities/UniversitiesDirectoryClient.tsx` to use `UniversityType[]` state, `normalizeTypeParam` for URL handling, exact match filtering, `countByType` chips, and bilingual empty state for 0-count types
- [X] T032 [P] [US3] Update `src/app/majors/components/MajorTypeFilter.tsx` to remove `TECHNOLOGICAL`, use `UniversityType` enum and `countByType`
- [X] T033 [P] [US3] Update `src/components/layout/Footer.tsx` to generate canonical type links via `toTypeParam` from `src/lib/university-type/index.ts`
- [X] T034 [P] [US3] Update `src/app/(marketing)/MarketingHomeClient.tsx` to use canonical link `?type=NATIONAL`

**Checkpoint**: User Story 3 is functional and testable independently — filter chips, URLs, and directory search match exact types predictably.

---

## Phase 6: User Story 4 - Arabic users see Arabic type labels on every page (Priority: P2)

**Goal**: Arabic users see حكومية / خاصة / أهلية / دولية on every surface including the server-rendered university detail page, and language switching updates all badges synchronously.

**Independent Test**: Switch site language to Arabic, open `/universities/<slug>` for any university, and confirm badge renders Arabic label; toggle language and confirm badge switches immediately.

### Implementation for User Story 4

- [X] T035 [P] [US4] Update `src/app/universities/[slug]/page.tsx` to replace server-side `formatUniversityType` with client `UniversityTypeBadge`
- [X] T036 [P] [US4] Update `src/contexts/LanguageContext.tsx` to remove deprecated/redundant university type translation keys (`Private`, `Public`, `National`)

**Checkpoint**: User Story 4 is functional and testable independently — detail page and all client components display localized type badges.

---

## Phase 7: User Story 5 - Catalog classifications are verified against an agreed rule (Priority: P3)

**Goal**: Audit all 43 institutions in the catalog against the official Ministry of Higher Education category, document evidence in `type-audit.md`, resolve data contradictions, and enforce blocking description check V4.

**Independent Test**: Verify `audit/type-audit.md` covers all 43 institutions with MoHE categories; run `npm run db:reset:verified -- --dry-run` and confirm 43 classified institutions with zero blocking errors.

### Implementation for User Story 5

- [X] T037 [P] [US5] Create `specs/005-university-type-consistency/audit/type-audit.md` documenting all 43 institutions, current type, MoHE category, resolved type, source reference, and action
- [X] T038 [US5] Update `src/server/etl/BilingualEnrichmentProvider.ts` to add `typeSource` evidence to all 43 records in `VERIFIED_INSTITUTIONS_METADATA`, remove `"PRIVATE"` fallback, and apply audit corrections (NU, EJUST, UFE, etc.) (depends on T037)
- [X] T039 [US5] Update `src/server/etl/CatalogValidator.ts` to make rule V4 (`DESCRIPTION_CONTRADICTION`) blocking once audit data is verified (depends on T038)
- [X] T040 [US5] Execute verified catalog reset dry run with `npm run db:reset:verified -- --dry-run` to validate 43 records and zero blocking errors (depends on T038, T039)

**Checkpoint**: User Story 5 is complete — all 43 institutions are verified against MoHE standards with documented source evidence.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, end-to-end type safety validation, and test suite execution.

- [X] T041 [P] Run `npx tsc --noEmit` to verify type safety across all modified files with zero errors
- [X] T042 [P] Run full test suite with `npx vitest run` to verify all unit, ETL, and guard tests pass
- [X] T043 Execute manual cross-surface verification runbook per `specs/005-university-type-consistency/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — **BLOCKS all user stories**.
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2).
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2).
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2).
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2).
- **User Story 5 (Phase 7)**: Depends on User Story 2 (Phase 4) and content owner audit inputs.
- **Polish (Phase 8)**: Depends on all user stories (Phases 3–7) being complete.

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2 foundation.
- **US2 (P1)**: Independent after Phase 2 foundation.
- **US3 (P2)**: Independent after Phase 2 foundation.
- **US4 (P2)**: Independent after Phase 2 foundation.
- **US5 (P3)**: Depends on US2 pipeline validation and content-owner verification in `type-audit.md`.

### Parallel Opportunities

- **Phase 2 (Foundational)**: T003, T004, T005, and T006 can all be authored in parallel once directory structure is created.
- **Phase 3 (US1)**: UI component updates T007 through T016 and route creation T017 can be implemented in parallel across independent component files.
- **Phase 4 (US2)**: T019, T020, T022, T023, T024, T026, T027, T028 can be implemented in parallel across schemas, legacy scripts, and repository files.
- **Phase 5 (US3)**: T030, T032, T033, T034 can be implemented in parallel.
- **Phase 6 (US4)**: T035 and T036 can be implemented in parallel.

---

## Parallel Example: User Story 1

```bash
# Author all independent component updates for User Story 1 together:
Task: "Replace type label rendering in src/components/university/UniversityCard.tsx"
Task: "Replace type label rendering in src/components/university/UniversityModal.tsx"
Task: "Update src/components/dashboard/BookmarkCard.tsx to render type with UniversityTypeBadge"
Task: "Update src/app/compare/page.tsx to use getUniversityTypeLabel"
Task: "Update src/app/majors/components/MajorUniList.tsx to use UniversityTypeBadge"
Task: "Update src/app/(marketing)/MarketingHomeClient.tsx to use UniversityTypeBadge"
Task: "Create cached catalog endpoint route in src/app/api/universities/search-index/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T006) — **CRITICAL**: foundation must be tested and passing
3. Complete Phase 3: User Story 1 (T007–T018)
4. **STOP and VALIDATE**: Verify badge rendering across all surfaces and check endpoint caching.
5. Deploy/demo MVP increment.

### Incremental Delivery

1. **Foundation**: Pure module + `UniversityTypeBadge` + unit/guard tests (Phases 1–2).
2. **Increment 1 (MVP)**: User Story 1 delivers identical badges across all 8 surfaces with fresh search index endpoint (Phase 3).
3. **Increment 2**: User Story 4 fixes Arabic detail page badge (Phase 6).
4. **Increment 3**: User Story 3 delivers robust, tolerant type filtering and data-driven chips (Phase 5).
5. **Increment 4**: User Story 2 establishes bulletproof import validation and audit fields (Phase 4).
6. **Increment 5**: User Story 5 audits all 43 institutions and deploys verified data corrections (Phase 7).
7. **Final Validation**: Polish, full test suite, and quickstart runbook (Phase 8).
