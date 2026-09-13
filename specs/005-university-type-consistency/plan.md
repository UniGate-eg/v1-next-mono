# Implementation Plan: University Type Consistency

**Branch**: `005-university-type-consistency` | **Date**: 2026-09-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-university-type-consistency/spec.md`

## Summary

Institution type badges (Public / Private / National / International) disagree across pages. The causes are a substring-matching bug, conflicting defaults, six separate label lists (two with types that don't exist), mismatched URL casing, a detail page that ignores language, a stale static catalog snapshot on two pages, and at least one self-contradicting record.

**Approach**:
1. Make one pure module (`src/lib/university-type/`) the only definition of types, labels, parsing, and URL normalisation, with one `UniversityTypeBadge` component on top.
2. Remove every default and make unrecognised or missing types fail into a review report at import.
3. Make type filters use exact enum values with tolerant, backward-compatible links and data-driven chips.
4. Serve every client surface from one tag-invalidated catalog endpoint.
5. Audit all 43 institutions against the Ministry of Higher Education category (clarification Q1 = A) and record the evidence for each.

Details and evidence are in [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), Node.js 20/24 LTS  
**Primary Dependencies**: Next.js 15.1 App Router, React 19, Prisma 6.4, Zod 3.24, react-hook-form 7, shadcn/ui, SheetJS `xlsx` 0.18 (ETL)  
**Storage**: PostgreSQL (Neon), schema managed with `prisma db push` (no migrations directory)  
**Testing**: Vitest 3 (`vitest.config.ts`, node environment, `tests/unit/**`); `tsc --noEmit`  
**Target Platform**: Vercel (Fluid Compute, Node runtime); modern browsers; bilingual EN/AR with RTL  
**Project Type**: Full-stack web application (single Next.js project + CLI ETL scripts)  
**Performance Goals**: No regression. The catalog endpoint serves from the data cache; payload equals today's static index.  
**Constraints**:
- Type changes visible on every surface within 1 hour (normally the next request).
- Existing shared links keep working.
- No destructive schema change.
- Language remains client-side (`localStorage`).

**Scale/Scope**: 43 institutions, 4 types, about 20 files touched across 8 user-facing surfaces, the admin studio, and 3 importers.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the **unratified template** (placeholders only), so it defines no formal gates. The check below applies the conventions established by features 001–004 instead:

| Gate (project convention) | Pre-design | Post-design | Notes |
|---|---|---|---|
| Strict typing, no new `any` | ✅ | ✅ | Removes `\| string` and `any` from type fields (data-model §6) |
| SOLID / DI in ETL (004 NFR-004) | ✅ | ✅ | `IEnrichmentProvider` contract tightened (nullable return), no new concrete coupling |
| No destructive or breaking DB changes | ✅ | ✅ | Drops a default and adds a nullable column (data-model §2) |
| Validation before mutation (004 pipeline) | ✅ | ✅ | Type review entries are blocking errors in the existing abort path |
| Audit trail for catalog changes | ✅ | ✅ | Admin type change goes through existing `AuditLog` with `typeSourceRef` |
| Unit tests for new logic (Vitest) | ✅ | ✅ | ≥25 parser fixtures, URL fixtures, validator cases, guard test |
| Bilingual parity EN/AR | ✅ | ✅ | Compile-time exhaustive meta (`satisfies Record<UniversityType,…>`) |
| No unresolved NEEDS CLARIFICATION | ✅ | ✅ | Q1 resolved; all Technical Context items known |

**Result: PASS**, with no violations and nothing to record under Complexity Tracking. Recommend ratifying a constitution (`/speckit-constitution`) so future plans have formal gates.

## Project Structure

### Documentation (this feature)

```text
specs/005-university-type-consistency/
├── plan.md                 # This file
├── research.md             # Phase 0 — current-state inventory + decisions R1–R9
├── data-model.md           # Phase 1 — enum, schema delta, enrichment/review entities
├── quickstart.md           # Phase 1 — verification runbook
├── contracts/
│   ├── university-type-module.contract.md   # module API, guarantees, ≥25 parse fixtures, badge props
│   ├── type-filter-url.contract.md          # ?type= canonical form, tolerant input, directory behaviour
│   ├── search-index-endpoint.contract.md    # GET /api/universities/search-index + cache tags
│   └── import-review-report.contract.md     # typeCounts / typeReview output + exit behaviour
├── audit/
│   └── type-audit.md       # created during implementation (content owner fills MoHE category + source)
├── checklists/requirements.md
└── tasks.md                # Phase 2 — /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma                         # MODIFY: type no default; + typeSourceRef String?
└── etl/
    ├── transform.ts                      # MODIFY: mapUniversityType → parseUniversityType; review entries, skip on fail
    ├── seed-deep.ts                      # MODIFY: skip + log records with blocking review
    ├── seed-excel.ts                     # MODIFY: remove PRIVATE fallback create; review entry instead
    └── reset-verified-catalog.ts         # MODIFY: log typeCounts / typeReview summary

src/
├── lib/
│   ├── university-type/
│   │   └── index.ts                      # NEW: single source of truth (contract: university-type-module)
│   └── utils.ts                          # MODIFY: delete UNIVERSITY_TYPE_MAP + formatUniversityType
├── components/
│   ├── university/
│   │   ├── UniversityTypeBadge.tsx       # NEW: client badge (pill | inline)
│   │   ├── UniversityCard.tsx            # MODIFY: badge; remove "PUBLIC" fallback
│   │   ├── UniversityModal.tsx           # MODIFY: badge; remove "PUBLIC" fallback
│   │   └── UniversityFilters.tsx         # MODIFY: options from module
│   ├── dashboard/BookmarkCard.tsx        # MODIFY: badge
│   ├── layout/Footer.tsx                 # MODIFY: links via toTypeParam
│   └── admin/
│       ├── university-studio/tabs/GeneralInfoTab.tsx  # MODIFY: 4 options from module, remove SPECIALIZED; typeSourceRef field
│       ├── university-studio/UniversityStudio.tsx     # MODIFY: label via module
│       ├── UniversityDataTable.tsx                    # MODIFY: label via module
│       └── AdminDashboardView.tsx                     # MODIFY: label via module
├── app/
│   ├── api/universities/search-index/route.ts         # NEW: cached catalog endpoint
│   ├── universities/
│   │   ├── UniversitiesDirectoryClient.tsx            # MODIFY: enum filter state, exact match, data-driven chips, empty state
│   │   └── [slug]/page.tsx                            # MODIFY: UniversityTypeBadge (fixes Arabic)
│   ├── compare/page.tsx                               # MODIFY: label via module
│   ├── majors/components/MajorTypeFilter.tsx          # MODIFY: remove TECHNOLOGICAL, use countByType
│   ├── majors/components/MajorUniList.tsx             # MODIFY: remove local typeMap / PUBLIC fallback
│   ├── (marketing)/MarketingHomeClient.tsx            # MODIFY: ?type=NATIONAL link; remove PUBLIC fallback
│   └── admin/page.tsx                                 # MODIFY: remove "Public Institution" fallback
├── contexts/LanguageContext.tsx          # MODIFY: remove Private/Public/National dictionary keys
├── hooks/useUniversitySearch.ts          # MODIFY: fetch /api/universities/search-index
├── schemas/university.schema.ts          # MODIFY: z.enum from UNIVERSITY_TYPES; typeSourceRef rules
├── types/university.types.ts             # MODIFY: type: UniversityType (no | string)
└── server/
    ├── etl/
    │   ├── interfaces/IEnrichmentProvider.ts   # MODIFY: TypeSource; getEnrichment → | null
    │   ├── BilingualEnrichmentProvider.ts      # MODIFY: typeSource per record; no PRIVATE fallback; audit corrections
    │   └── CatalogValidator.ts                 # MODIFY: V1–V4 rules, typeCounts, typeReview; typed ValidatedUniversity
    ├── repositories/PostgresUniversityRepository.ts  # MODIFY: persist typeSourceRef; drop `as any` on type
    └── services/AdminUniversityService.ts   # MODIFY: require typeSourceRef when type changes (called from src/app/admin/actions/university.actions.ts)

tests/unit/
├── UniversityType.test.ts                # NEW: module fixtures + guarantees G1–G6
├── UniversityTypeConsistency.test.ts     # NEW: guard — no labels/phantom types outside module
└── etl/validator.test.ts                 # MODIFY: V1–V4 cases, typeCounts
```

**Structure Decision**: A single Next.js project, following the existing layout: `src/lib/*` for pure domain logic (like `src/lib/majors/`), `src/components/university/*` for shared UI, `src/server/etl/*` for the verified pipeline, and `tests/unit/*` for Vitest. No new packages or projects.

## Implementation Phases (for /speckit-tasks)

Every user story below can be delivered and tested on its own, in priority order.

| Phase | Delivers | Spec coverage | Depends on |
|---|---|---|---|
| **A. Foundation** | `src/lib/university-type` + tests (fixtures, G1–G6); `UniversityTypeBadge` | FR-001, FR-002 (base), FR-004 | — |
| **B. US1 + US4: one badge everywhere, in both languages** | Replace all 6 label sources and all fallbacks with the module/badge; tighten `type` typings; guard test; detail page badge | FR-002, FR-003, FR-006, SC-001, SC-006 | A |
| **C. US3: filters and links** | Directory enum filter state, exact match, `countByType` chips, empty state, tolerant parsing; majors chips; footer/home links | FR-009 – FR-014, SC-004, SC-005 | A |
| **D. US1 freshness** | `/api/universities/search-index` route with cache tags; hook switch | FR-015, SC-007 | — |
| **E. US2: import correctness** | Schema delta; `IEnrichmentProvider` nullable; `CatalogValidator` V1–V4 + report; legacy importers; admin form (4 options, required type, `typeSourceRef`) | FR-004 – FR-008, SC-002, SC-003 | A |
| **F. US5: audit and data corrections** | `audit/type-audit.md` (43 rows); content-owner verification; `typeSource` in dictionary; corrections (NU etc.); V4 made blocking; run verified reset with `--dry-run` then `--confirm-production` | FR-016 – FR-018, SC-008 | E + content owner |

**Release order**: A → B + C + D in parallel → E → F. Phases B–D fix everything users see even before the audit lands. F is the only phase with an external dependency: a content owner with access to official MoHE listings.

## Risks

| Risk | Mitigation |
|---|---|
| Production reset is required to apply audit corrections (F) | Use the existing 004 pipeline: advisory lock, snapshot, `--dry-run`, rollback |
| `db push` against production drops the default before all create paths set `type` | Phase E ships code (all creates pass explicit `type`) **before** running `db push` |
| Hiding chips with zero institutions removes "Public" entirely today (0 public institutions) | Intended per spec; the footer link lands on the explanatory empty state |
| Client badge causes a brief English→Arabic switch on the detail page | Same behaviour as every other bilingual element today; a cookie-based server locale is a separate feature |
| MoHE category unavailable for an institution | Keep the record's current type, mark `NEEDS_EVIDENCE` in the audit, and keep V2 non-blocking **only** for listed exceptions with an owner and due date |

## Complexity Tracking

No constitution violations, so nothing to justify.
