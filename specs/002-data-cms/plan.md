# Implementation Plan: Production Data Architecture & Admin CMS Suite

| Field | Value |
|:---|:---|
| **Feature ID** | `002-data-cms` |
| **Branch** | `002-data-cms` |
| **Date** | 2026-08-17 |
| **Spec** | [spec.md](spec.md) |
| **Data Model** | [data-model.md](data-model.md) |
| **Research** | [research.md](research.md) |
| **Author** | Platform Engineering |
| **Status** | Approved — Implementation Ready |

---

## 1. Executive Summary

This plan transitions the UniGate platform from monolithic static JavaScript bundles (`database.js` 1.19 MB, `roadmaps_data.js` 7.17 MB) into a **production-grade, normalized PostgreSQL data layer** operating behind a **built-in Admin CMS portal**. The architecture establishes end-to-end type safety, SOLID-principle compliance, ISR cache invalidation, and a zero-downtime ETL ingestion pipeline for 18,000+ lines of exhaustive Egyptian university data.

**Total scope**: 4 implementation phases over ~3–5 weeks of focused full-stack development.

---

## 2. Technical Context

| Concern | Choice | Version |
|:---|:---|:---|
| Language | TypeScript (Strict Mode) | 5.8+ |
| Runtime | Node.js | 20 LTS |
| Framework | Next.js App Router | 15.5.x |
| ORM | Prisma | 6.4.x |
| Database | PostgreSQL | 16+ (Neon Serverless or Supabase) |
| Auth | BetterAuth | Latest stable |
| Validation | Zod | 3.24+ |
| Testing | Vitest | 3.2+ |
| Package Manager | pnpm | 9.x |
| State Management | Zustand | 5.0 |

### Performance Budget

| Metric | Constraint |
|:---|:---|
| Initial JS transfer (public pages) | ≤ 150 KB gzipped |
| Slim search index size | ≤ 35 KB uncompressed |
| Admin save → public cache invalidation | < 2.0s |
| ETL full run (18K lines) | < 30s |
| Search autocomplete latency (client-side) | < 50ms |

---

## 3. Architecture: SOLID Principles & Design Patterns

### 3.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React Server + Client Components)          │
│  └─ Admin CMS UI, Public Catalog, University Modals, Search     │
├─────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER (Next.js Server Actions)                     │
│  └─ admin.actions.ts, university.actions.ts, suggestion.actions │
│  └─ Zod validation at entry points; no business logic here      │
├─────────────────────────────────────────────────────────────────┤
│  DOMAIN / SERVICE LAYER                                         │
│  └─ AdminService, UniversityService, SearchIndexService         │
│  └─ Pure business rules; depends on Repository interfaces only  │
├─────────────────────────────────────────────────────────────────┤
│  REPOSITORY LAYER (Interface + Two Implementations)             │
│  └─ IUniversityReader, IUniversityWriter                        │
│  └─ PostgresUniversityRepository (primary)                      │
│  └─ FallbackUniversityRepository (static data; read-only)       │
├─────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                                           │
│  └─ PrismaClient (singleton), BetterAuth, env validation        │
│  └─ ETL pipeline scripts (CLI-only, never HTTP)                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 SOLID Principle Map

| Principle | Application in This Feature |
|:---|:---|
| **S — Single Responsibility** | `UniversityRepository` → DB queries only. `UniversityMapper` → shape transformations only. `AdminService` → business rules + audit dispatch only. `CacheInvalidator` → `revalidateTag` calls only. |
| **O — Open/Closed** | Adding a Redis cache layer or Algolia adapter = new class implementing `IUniversityReader`, zero edits to existing repositories or services. |
| **L — Liskov Substitution** | `FallbackUniversityRepository` and `PostgresUniversityRepository` are fully interchangeable as `IUniversityReader`. Services never call `instanceof`; they call the interface. |
| **I — Interface Segregation** | `IUniversityReader` (read-only public queries) and `IUniversityWriter` (admin mutations) are separate interfaces. Public routes receive only `IUniversityReader`. Admin Server Actions receive only `IUniversityWriter`. `IAuditLogRepository` exposes only `create()` — never `update()` or `delete()`. |
| **D — Dependency Inversion** | All Services declare their repository dependencies as constructor parameters typed to the interface. Composition root (`src/lib/di.ts`) wires concrete implementations. No `import { prisma }` inside Services. |

### 3.3 Design Patterns

| Pattern | Usage |
|:---|:---|
| **Repository Pattern** | `PostgresUniversityRepository`, `FallbackUniversityRepository`, `AuditLogRepository` — all data access encapsulated; zero raw `prisma.*` calls outside repository classes |
| **Mapper Pattern** | `UniversityMapper.toDTO()`, `.toSlimIndex()`, `.toAdminDTO()` — enforces strict client/server type boundaries |
| **Decorator Pattern** | `CachedUniversityRepository` wraps any `IUniversityReader` adding Next.js `unstable_cache` tagging transparently |
| **Strategy Pattern** | `ISearchStrategy` allows swapping between `SlimIndexSearch` (client-side JSON), `PostgresFullTextSearch` (SQL `tsvector`), or future `AlgoliaSearch` |
| **Command Pattern** | Each admin Server Action constructs an explicit Command object with `execute()` and `audit()` methods — separating mutation logic from audit log generation |
| **Observer Pattern** | `CacheInvalidationObserver.onUniversityUpdated(slug)` is called by the Command after execution — decoupling mutation from cache concerns |
| **Factory Pattern** | `UniversityRepositoryFactory.create()` selects `PostgresUniversityRepository` or `FallbackUniversityRepository` based on DB health at startup |

---

## 4. Directory Structure

```text
src/
├── app/
│   ├── (marketing)/                           # Public landing, news, match finder
│   ├── admin/                                 # [NEW] Admin CMS Portal (Role Protected)
│   │   ├── layout.tsx                         # Shell: AdminSidebar + AdminHeader + role guard
│   │   ├── page.tsx                           # Dashboard: stats tiles + recent activity feed
│   │   ├── universities/
│   │   │   ├── page.tsx                       # Data table: all institutions (paginated)
│   │   │   ├── new/
│   │   │   │   └── page.tsx                   # Create university wizard
│   │   │   └── [id]/
│   │   │       ├── page.tsx                   # Edit profile: overview, rankings, contacts
│   │   │       ├── faculties/
│   │   │       │   └── page.tsx               # Faculty & Dean manager
│   │   │       └── programs/
│   │   │           └── page.tsx               # Degree Program manager (tuition editor)
│   │   ├── suggestions/
│   │   │   └── page.tsx                       # Moderation queue: Approve/Reject/Merge
│   │   ├── audit-log/
│   │   │   └── page.tsx                       # Paginated audit history with filters
│   │   └── export/
│   │       └── page.tsx                       # JSON snapshot download trigger
│   ├── api/
│   │   └── universities/
│   │       └── [slug]/
│   │           └── route.ts                   # [NEW] On-demand detail fetch (ISR cached)
│   ├── universities/                          # Public catalog (Server Components + ISR)
│   ├── compare/                               # Comparison matrix
│   └── dashboard/                             # Student Kanban board
│
├── components/
│   ├── admin/                                 # [NEW] Admin CMS UI Components
│   │   ├── AdminSidebar.tsx                   # Navigation sidebar with role-aware links
│   │   ├── AdminHeader.tsx                    # Top bar with user context + sign out
│   │   ├── UniversityForm.tsx                 # Bilingual profile editor (EN + AR tabs)
│   │   ├── FacultyModal.tsx                   # Faculty create/edit dialog
│   │   ├── ProgramModal.tsx                   # Degree program create/edit + tuition
│   │   ├── SuggestionReviewDialog.tsx         # Before/after diff + Approve/Reject actions
│   │   ├── ConflictResolutionDialog.tsx       # Concurrent edit merge-or-overwrite UI
│   │   └── AuditLogTable.tsx                  # Paginated audit event table
│   ├── university/                            # Public-facing university components
│   └── layout/                               # Navbar, Footer
│
├── server/
│   ├── actions/                               # Next.js Server Actions (application layer)
│   │   ├── admin/
│   │   │   ├── university.admin.actions.ts    # [NEW] University CRUD + cache invalidation
│   │   │   ├── faculty.admin.actions.ts       # [NEW] Faculty CRUD
│   │   │   ├── program.admin.actions.ts       # [NEW] DegreeProgram CRUD
│   │   │   └── suggestion.admin.actions.ts    # [NEW] Moderation: Approve, Reject
│   │   └── public/
│   │       ├── university.actions.ts          # Public read + filter queries
│   │       └── suggestion.actions.ts          # Community suggestion submission
│   │
│   ├── services/                              # Domain service layer
│   │   ├── UniversityService.ts               # Public read business logic
│   │   ├── AdminUniversityService.ts          # [NEW] Admin mutations + validation rules
│   │   ├── AuditService.ts                    # [NEW] Audit log dispatch (always async-safe)
│   │   ├── SearchIndexService.ts              # [NEW] Slim JSON index builder
│   │   └── SuggestionService.ts               # [NEW] Suggestion lifecycle management
│   │
│   ├── repositories/
│   │   ├── interfaces/
│   │   │   ├── IUniversityRepository.ts       # [NEW] IUniversityReader + IUniversityWriter
│   │   │   ├── IFacultyRepository.ts          # [NEW]
│   │   │   ├── IDegreeProgramRepository.ts    # [NEW]
│   │   │   ├── IAuditLogRepository.ts         # [NEW] create() ONLY — enforced at interface
│   │   │   └── ISuggestionRepository.ts       # [NEW]
│   │   ├── PostgresUniversityRepository.ts    # [NEW] Primary Prisma implementation
│   │   ├── FallbackUniversityRepository.ts    # [NEW] Static in-memory implementation
│   │   ├── CachedUniversityRepository.ts      # [NEW] Decorator pattern cache layer
│   │   ├── AuditLogRepository.ts              # [NEW] INSERT-only audit log writer
│   │   ├── SuggestionRepository.ts            # [NEW]
│   │   └── UniversityRepositoryFactory.ts     # [NEW] Selects primary vs. fallback
│   │
│   └── mappers/
│       ├── UniversityMapper.ts                # [NEW] DB Model → DTO → SlimIndex → AdminDTO
│       ├── FacultyMapper.ts                   # [NEW]
│       └── DegreeProgramMapper.ts             # [NEW]
│
├── schemas/                                   # Zod validation contracts (shared app ↔ server)
│   ├── university.schema.ts                   # [NEW] Create/Update University schemas
│   ├── faculty.schema.ts                      # [NEW]
│   ├── program.schema.ts                      # [NEW] includes tuition int validation
│   └── suggestion.schema.ts                   # [NEW]
│
├── types/
│   ├── university.types.ts                    # [NEW] UniversityDTO, SlimSearchToken, AdminDTO
│   ├── faculty.types.ts                       # [NEW]
│   ├── program.types.ts                       # [NEW]
│   └── audit.types.ts                         # [NEW] AuditLogEntry, AuditAction enum
│
└── lib/
    ├── prisma.ts                              # [MODIFIED] PrismaClient singleton + failover
    ├── di.ts                                  # [NEW] Dependency injection composition root
    └── cache-invalidator.ts                   # [NEW] revalidateTag/revalidatePath orchestrator

prisma/
├── schema.prisma                              # [EXPANDED] Full normalized schema
├── migrations/                               # Auto-generated Prisma migrations
└── etl/
    ├── seed-deep.ts                           # [NEW] Main ETL entry point
    ├── transform.ts                           # [NEW] Raw JSON → typed intermediate shape
    ├── validate.ts                            # [NEW] Zod pre-validation; writes etl-errors.jsonl
    └── checkpoint.ts                          # [NEW] Progress tracking for large imports

scripts/
└── generate-search-index.ts                   # [NEW] CLI: builds public/search-index.json

public/
└── search-index.json                          # [NEW] Pre-built slim search tokens (~30 KB)
```

---

## 5. Constitution Check

| Gate | Status | Notes |
|:---|:---|:---|
| Relational integrity via FK cascades | ✅ Pass | Enforced in Prisma schema on all child relations |
| Single Responsibility per module | ✅ Pass | Repository, Service, Mapper, Action layers strictly separated |
| Zero `any` in TypeScript | ✅ Pass | All types flow from Prisma-generated types → Zod inference → DTO types |
| All secrets via env validation | ✅ Pass | `src/env.ts` with `z.string().url()` at startup |
| Testability — all services mockable | ✅ Pass | All dependencies injected via interfaces; Vitest mocks trivial |
| Bilingual completeness | ✅ Pass | Every text field has `En` and `Ar` variants; null fallback enforced in Mapper |
| AuditLog is INSERT-only | ✅ Pass | `IAuditLogRepository` interface exposes only `create()` |
| Admin endpoints double-validated | ✅ Pass | Role check in both middleware AND inside each Server Action |
| ETL never callable via HTTP | ✅ Pass | Scripts in `prisma/etl/` — no Next.js route handler wraps them |

---

## 6. Implementation Phases

### Phase 1: Schema Expansion & ETL Ingestion Pipeline

**Goal**: Ingest all 30+ Egyptian universities, 150+ faculties, and 400+ degree programs from the raw dataset (`Egyptian_Universities_Deep_Exhaustive_Database.json`, 5.24 MB, 18,001 lines) into PostgreSQL with full relational normalization and zero data loss.

#### 1.1 Data Source & Extraction Strategy
- **Primary Source**: `Egyptian_Universities_Deep_Exhaustive_Database.json` (contains rich nested faculties, deans, bilingual descriptions, degree programs with EGP/USD tuition, career outcomes, and international accreditations).
- **Secondary Fallback Source**: `src/data/database.js` (provides UI emojis, short codes, and curated tags).

#### 1.2 Transformation & Data Cleansing Rules (`prisma/etl/transform.ts`)
1. **Tuition Parsing**: String values like `"EGP 85,000 / Year"` and `"$4,500 / Year"` are parsed using regular expressions into raw integer values (`85000` and `4500`).
2. **Slug Generation**: Stable URL-friendly slugs are computed for every university (e.g. `guc`, `auc`, `cairo-university`) and degree program (e.g. `bsc-civil-engineering-guc`).
3. **Education Model Classification**: Mapped to enum values (`AMERICAN`, `GERMAN`, `BRITISH`, `EGYPTIAN`, `FRENCH`, `CANADIAN`).
4. **Relational Hierarchy Mapping**:
   - `University` (Root entity with institutional metadata, rankings, and contact lists)
   - `Faculty` (Nested entity linked via `universityId`, containing `deanName` and `departments[]`)
   - `DegreeProgram` (Nested entity linked via `universityId` and optional `facultyId`)
   - `Accreditation` (Child entities linked via `universityId`)

#### 1.3 Transactional Injection Sequence (`prisma/etl/seed-deep.ts`)
Each university is inserted/updated inside an isolated `prisma.$transaction()`:
```typescript
// Transactional Injection per University
await prisma.$transaction(async (tx) => {
  // 1. Upsert University Root
  const university = await tx.university.upsert({
    where: { slug: normalized.slug },
    create: normalized.universityData,
    update: normalized.universityData,
  });

  // 2. Upsert Faculties & Build Lookup Map
  const facultyMap = new Map<string, string>();
  for (const facultyInput of normalized.faculties) {
    const faculty = await tx.faculty.create({
      data: { ...facultyInput, universityId: university.id },
    });
    facultyMap.set(faculty.nameEn.toLowerCase(), faculty.id);
  }

  // 3. Insert Degree Programs with Resolved Faculty Foreign Keys
  for (const programInput of normalized.degreePrograms) {
    const matchedFacultyId = programInput.facultyName 
      ? facultyMap.get(programInput.facultyName.toLowerCase()) 
      : null;

    await tx.degreeProgram.create({
      data: {
        ...programInput.data,
        universityId: university.id,
        facultyId: matchedFacultyId,
      },
    });
  }

  // 4. Batch Insert Accreditations
  if (normalized.accreditations.length > 0) {
    await tx.accreditation.createMany({
      data: normalized.accreditations.map(acc => ({
        ...acc,
        universityId: university.id,
      })),
    });
  }
});
```

#### 1.4 Execution & Verification Workflow
```bash
# Step 1: Push Schema to Database
pnpm prisma db push

# Step 2: Run the Ingestion Pipeline
pnpm tsx prisma/etl/seed-deep.ts

# Step 3: Verify Ingestion Row Counts
pnpm tsx -e "import { prisma } from './src/lib/prisma'; async function test() { console.log('Universities:', await prisma.university.count(), 'Programs:', await prisma.degreeProgram.count()); } test();"
```

**Files to create/modify**:

| File | Change |
|:---|:---|
| `prisma/schema.prisma` | **MODIFY** — Add `Faculty`, `DegreeProgram`, `Accreditation`, `AuditLog` models; expand `University` with 23 new fields; add `UserRole`, `PublishStatus`, `EducationModel` enums; add all indexes |
| `prisma/etl/transform.ts` | **NEW** — Pure function: `RawUniversity → NormalizedUniversityInput`; handles string tuition parsing → integer; slugifies all entity names |
| `prisma/etl/validate.ts` | **NEW** — Zod schema for raw JSON records; validates, streams errors to `etl-errors.jsonl` |
| `prisma/etl/checkpoint.ts` | **NEW** — Reads/writes `.etl-checkpoint.json`; allows resume after partial failures |
| `prisma/etl/seed-deep.ts` | **NEW** — Orchestrator: reads JSON → validates each record → batch-upserts in `prisma.$transaction()` per university → logs errors |
| `src/env.ts` | **MODIFY** — Add `NEXT_PUBLIC_SITE_URL` validation if missing |

**Verification gate**: `pnpm tsx prisma/etl/seed-deep.ts` on CI-seeded database with test JSON → assert row counts match input + zero duplicates + zero FK constraint violations.

---

### Phase 2: Domain Layer — Repositories, Services, Mappers, Interfaces

**Goal**: Full SOLID-compliant server-side domain layer with end-to-end type safety.

**Files to create/modify**:

| File | Change | SOLID Principle |
|:---|:---|:---|
| `src/server/repositories/interfaces/IUniversityRepository.ts` | **NEW** — `IUniversityReader` (findMany, findBySlug, findForSearch) + `IUniversityWriter` (create, update, archive) | ISP, DIP |
| `src/server/repositories/interfaces/IAuditLogRepository.ts` | **NEW** — `create(entry: AuditLogEntry): Promise<void>` — only method | ISP, SRP |
| `src/server/repositories/PostgresUniversityRepository.ts` | **NEW** — Implements `IUniversityReader` + `IUniversityWriter`; all Prisma queries here only | SRP, OCP |
| `src/server/repositories/FallbackUniversityRepository.ts` | **NEW** — Implements `IUniversityReader` from static JSON; `IUniversityWriter` methods throw `NotSupportedError` | LSP, SRP |
| `src/server/repositories/CachedUniversityRepository.ts` | **NEW** — Decorator implementing `IUniversityReader`; wraps inner repo with `unstable_cache` + tags | OCP (Decorator) |
| `src/server/repositories/AuditLogRepository.ts` | **NEW** — Implements `IAuditLogRepository`; direct `prisma.auditLog.create()` — no other Prisma calls | SRP |
| `src/server/repositories/UniversityRepositoryFactory.ts` | **NEW** — `create(): IUniversityReader` — checks DB health, returns `CachedUniversityRepository(PostgresRepo)` or `FallbackRepo` | Factory |
| `src/server/mappers/UniversityMapper.ts` | **NEW** — Static class: `toDTO()`, `toSlimIndex()`, `toAdminDTO()` — zero `any` | SRP, Mapper |
| `src/server/services/AdminUniversityService.ts` | **NEW** — Constructor: `(writer: IUniversityWriter, audit: IAuditLogRepository)`. Methods: `createUniversity()`, `updateUniversity()`, `archiveUniversity()` — each creates AuditLog in transaction | DIP, SRP |
| `src/server/services/SearchIndexService.ts` | **NEW** — Constructor: `(reader: IUniversityReader)`. Method: `buildSlimIndex(): SlimSearchToken[]` | DIP, SRP |
| `src/lib/di.ts` | **NEW** — Composition root: `export const universityService = new AdminUniversityService(new PostgresUniversityRepository(prisma), new AuditLogRepository(prisma))` | DIP |
| `src/lib/cache-invalidator.ts` | **NEW** — `invalidateUniversity(slug: string)`: calls `revalidateTag`, `revalidatePath` | SRP, Observer |
| `src/schemas/university.schema.ts` | **NEW** — Zod `CreateUniversitySchema`, `UpdateUniversitySchema` | |
| `src/schemas/program.schema.ts` | **NEW** — Zod `CreateDegreeProgramSchema`; `tuitionEgpPerYear: z.number().int().nonnegative()` | |
| `src/types/university.types.ts` | **NEW** — `UniversityDTO`, `SlimSearchToken`, `AdminUniversityDTO`, `UniversityFilters` | |

**Verification gate**: `pnpm test` passes all unit tests for `UniversityMapper`, `AdminUniversityService`, `PostgresUniversityRepository` (with Prisma mock).

---

### Phase 3: Admin CMS Portal (`/admin`)

**Goal**: Fully functional, role-protected admin management interface with live cache invalidation.

**Middleware & Authorization**:

```typescript
// src/middleware.ts — role-based route protection
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }
}
```

**Admin Server Action pattern (every mutation follows this)**:

```typescript
// src/server/actions/admin/university.admin.actions.ts
'use server'

export async function updateUniversityAction(
  input: z.infer<typeof UpdateUniversitySchema>
): Promise<ActionResult<UniversityDTO>> {
  // 1. Validate session + role (defense-in-depth — not just middleware)
  const session = await requireAdminSession()

  // 2. Validate input with Zod
  const parsed = UpdateUniversitySchema.safeParse(input)
  if (!parsed.success) return { success: false, errors: parsed.error.flatten() }

  // 3. Execute domain service (business logic + audit write in one transaction)
  const result = await adminUniversityService.updateUniversity(parsed.data, session.user)

  // 4. Invalidate ISR cache (Observer)
  await cacheInvalidator.invalidateUniversity(parsed.data.slug)

  return { success: true, data: result }
}
```

**Files to create**:

| File | Description |
|:---|:---|
| `src/app/admin/layout.tsx` | Shell: `AdminSidebar` + `AdminHeader` + role guard wrapper |
| `src/app/admin/page.tsx` | Dashboard: stats (university count, pending suggestions, recent audit events) |
| `src/app/admin/universities/page.tsx` | Server Component: paginated university data table |
| `src/app/admin/universities/new/page.tsx` | `UniversityForm` wired to `createUniversityAction` |
| `src/app/admin/universities/[id]/page.tsx` | Profile editor: overview, rankings, contacts, social links |
| `src/app/admin/universities/[id]/faculties/page.tsx` | Faculty list + `FacultyModal` for create/edit |
| `src/app/admin/universities/[id]/programs/page.tsx` | Degree program table + `ProgramModal` with numeric tuition |
| `src/app/admin/suggestions/page.tsx` | Pending suggestions queue + `SuggestionReviewDialog` |
| `src/app/admin/audit-log/page.tsx` | Paginated audit log with entity type / actor / date filters |
| `src/app/admin/export/page.tsx` | Export trigger + download link for JSON snapshot |
| `src/server/actions/admin/university.admin.actions.ts` | `createUniversity`, `updateUniversity`, `archiveUniversity`, `publishUniversity` |
| `src/server/actions/admin/faculty.admin.actions.ts` | `upsertFaculty`, `deleteFaculty` |
| `src/server/actions/admin/program.admin.actions.ts` | `upsertDegreeProgram`, `deleteDegreeProgram` |
| `src/server/actions/admin/suggestion.admin.actions.ts` | `approveSuggestion`, `rejectSuggestion` |
| `src/components/admin/UniversityForm.tsx` | Bilingual form with EN/AR tab switcher; controlled by react-hook-form |
| `src/components/admin/FacultyModal.tsx` | Dialog: faculty name (EN/AR), dean, departments (tag input) |
| `src/components/admin/ProgramModal.tsx` | Dialog: program name, duration, integer tuition fields (EGP, USD), career tags |
| `src/components/admin/SuggestionReviewDialog.tsx` | Before/after field diff view + Approve/Reject with admin note |
| `src/components/admin/ConflictResolutionDialog.tsx` | Shows conflicting fields; merge or force-overwrite options |
| `src/components/admin/AuditLogTable.tsx` | Paginated log table with actor, action, entity, timestamp |

---

### Phase 4: Slim Search Index & Public Catalog Performance

**Goal**: Replace 8.36 MB client bundles with ≤ 150 KB total payload; sub-50ms search.

**Files to create/modify**:

| File | Change |
|:---|:---|
| `scripts/generate-search-index.ts` | **NEW** — CLI script querying `findForSearch()` from `PostgresUniversityRepository`; writes `public/search-index.json`; run via `pnpm generate-index` |
| `public/search-index.json` | **NEW** — Generated output; ~30 KB; gitignored in production, generated at build/deploy time |
| `src/app/api/universities/[slug]/route.ts` | **NEW** — Route Handler with `unstable_cache` and tag `university-${slug}`; serves full detail JSON for modal fetch |
| `src/app/(marketing)/page.tsx` | **MODIFY** — Remove `database.js` import; replace with `UniversityService.findMany()` Server Component call |
| `src/app/universities/page.tsx` | **MODIFY** — Replace static import with paginated `findMany()` call; 20 per page |
| `src/hooks/useUniversitySearch.ts` | **MODIFY** — Replace bundle reference with `fetch('/search-index.json')` on mount (once, cached in browser) |
| `src/data/database.js` | **DELETE** — Remove after all references replaced |

---

### Phase 5: Testing, Verification & Rollout

**Unit Tests (Vitest)**:

| Test File | Covers |
|:---|:---|
| `src/server/mappers/UniversityMapper.test.ts` | `toDTO()`, `toSlimIndex()`, `toAdminDTO()` — null safety, bilingual fallback |
| `src/server/services/AdminUniversityService.test.ts` | Mutation flow; audit log write; rejects invalid roles |
| `src/server/repositories/PostgresUniversityRepository.test.ts` | Prisma mock; filter query construction; pagination |
| `src/server/repositories/FallbackUniversityRepository.test.ts` | Returns static data; write methods throw `NotSupportedError` |
| `prisma/etl/validate.test.ts` | Valid records pass; invalid records captured to error log |
| `prisma/etl/transform.test.ts` | String tuition `"EGP 85,000 / Year"` → integer `85000`; slug generation |

**Integration Tests**:

| Test | Validates |
|:---|:---|
| Admin save → `revalidateTag` called | `cache-invalidator.ts` integration |
| Concurrent edit conflict detection | Two simultaneous PATCH requests; second returns 409 |
| Suggestion approve → university record updated + audit logged | End-to-end mutation chain |

**Acceptance Verification Checklist**:
- [ ] `pnpm prisma db push` runs without errors on expanded schema
- [ ] `pnpm tsx prisma/etl/seed-deep.ts` completes in < 30s; `etl-errors.jsonl` has 0 entries for valid dataset
- [ ] `pnpm generate-index` produces `public/search-index.json` ≤ 35 KB
- [ ] Lighthouse mobile audit: LCP < 2.5s, initial JS ≤ 150 KB
- [ ] Admin saves a tuition change; public catalog reflects it in < 2.0s
- [ ] `pnpm test` all tests pass; zero `any` type errors in `pnpm run type-check`

---

## 7. Risk Registry

| Risk | Likelihood | Impact | Mitigation |
|:---|:---|:---|:---|
| ETL pipeline timeout on large transactions | Medium | High | Batch per university (10 per transaction max); checkpoint-based resumption |
| Concurrent admin edits causing data loss | Low | High | Optimistic locking via `updatedAt` comparison; `ConflictResolutionDialog` |
| `revalidateTag` not purging CDN edge cache | Low | Medium | Test on Vercel preview before main merge; add fallback `revalidatePath` |
| Bilingual field left null by admin | High | Low | `UniversityMapper.toDTO()` coalesces Arabic to English if `nameAr` is null |
| Search index drift after admin publish | Medium | Low | `/admin` success action triggers `generate-index` re-run via Next.js revalidation event |
| ETL encounters unknown education model value | Medium | Medium | `transform.ts` maps unknown values to `EGYPTIAN` with a warning log |

---

## 8. Rollout Strategy

```
main (stable)
  └─ 002-data-cms (this branch)
      ├── Phase 1: Schema + ETL     → PR: "feat(db): expand schema and add ETL pipeline"
      ├── Phase 2: Domain Layer     → PR: "feat(server): repository, service, mapper layers"
      ├── Phase 3: Admin CMS        → PR: "feat(admin): admin CMS portal with full CRUD"
      ├── Phase 4: Performance      → PR: "perf: slim search index + remove static bundles"
      └── Phase 5: Tests + Fix      → PR: "test: vitest suite + acceptance verification"
```

**Merge criteria before each PR**:
1. All `pnpm test` green — no skipped tests
2. `pnpm run type-check` zero errors
3. Lighthouse mobile score ≥ 90 (after Phase 4 PR)
4. Code review approved by at least 1 reviewer

---

## 9. Generated Artifacts

| Artifact | Path |
|:---|:---|
| Feature Specification | [spec.md](spec.md) |
| Research & Architecture Decisions | [research.md](research.md) |
| Data Model & Prisma Schema | [data-model.md](data-model.md) |
| Admin Actions Contract | [contracts/admin-actions.contract.md](contracts/admin-actions.contract.md) |
| Search API Contract | [contracts/search-api.contract.md](contracts/search-api.contract.md) |
| Suggestion Pipeline Contract | [contracts/suggestion-pipeline.contract.md](contracts/suggestion-pipeline.contract.md) |
| Developer Quickstart | [quickstart.md](quickstart.md) |


---

## Summary

This plan transitions the UniGate platform from monolithic static JavaScript bundles (`database.js` 1.19MB, `roadmaps_data.js` 7.17MB) into a **Production-Grade Relational Data Architecture in PostgreSQL** paired with an **Integrated Admin CMS Management Suite (`/admin`)**, an **Automated Exhaustive ETL Ingestion Pipeline**, a **Slim Client Search Index (<40 KB)**, and **On-Demand Cache Invalidation (`revalidateTag`)**.

---

## Technical Context

- **Language/Version**: TypeScript 5.8+ (Strict Mode) / Node.js 20+
- **Primary Framework**: Next.js 15 (App Router, Server Actions, Data Cache)
- **Database & ORM**: PostgreSQL (Neon / Supabase) + Prisma 6.4
- **Authentication**: BetterAuth with Role-Based Access Control (`STUDENT`, `EDITOR`, `ADMIN`, `SUPER_ADMIN`)
- **Validation**: Zod 3.24
- **State & UI**: Zustand 5.0, Tailwind CSS, Lucide React, UniCompass Design System
- **Testing**: Vitest 3.2+ (Unit and Repository Tests)
- **Performance Targets**: 
  - Admin Save to Public Cache Invalidation: < 2.0s
  - Client Initial Bundle Payload: < 150 KB
  - Search Autocomplete Query Latency: < 50ms
  - Full ETL Ingestion Duration (18,000+ lines): < 30s

---

## Constitution Check

- [x] **Relational Integrity**: Enforced via Prisma foreign key relations with cascade rules.
- [x] **Single Responsibility & SOLID**: Repositories, Services, Mappers, and Server Actions strictly decoupled.
- [x] **Zero Hardcoded Secrets**: All DB and Auth credentials loaded via `src/env.ts`.
- [x] **Testability**: All Services, Repositories, and Mappers covered by Vitest unit tests.
- [x] **Bilingual Completeness**: Full Arabic and English representation on all database entities and admin form controls.

---

## Project Structure

```text
src/
├── app/
│   ├── (marketing)/                 # Public home, news, match finder
│   ├── admin/                       # [NEW] Admin CMS Portal (Role Protected)
│   │   ├── layout.tsx               # Admin shell with sidebar & auth guards
│   │   ├── page.tsx                 # Dashboard metrics & quick actions
│   │   ├── universities/            # University CRUD list & editors
│   │   │   ├── page.tsx             # Table of all institutions
│   │   │   ├── new/page.tsx         # Create university form
│   │   │   └── [id]/                # Edit university & nested entities
│   │   │       ├── page.tsx         # Profile details editor
│   │   │       ├── faculties/page.tsx # Faculty & Dean management
│   │   │       └── programs/page.tsx  # Degree programs & tuition manager
│   │   ├── suggestions/             # [NEW] Moderation Queue
│   │   │   └── page.tsx             # Inspect & 1-click Approve/Merge
│   │   ├── audit-log/page.tsx       # [NEW] Historical audit log viewer
│   │   └── export/page.tsx          # [NEW] JSON database snapshot export
│   ├── api/
│   │   └── search-index/route.ts    # [NEW] Dynamic search index endpoint
│   ├── universities/                # Public catalog
│   ├── compare/                     # Comparison matrix
│   └── dashboard/                   # Student Kanban board
├── components/
│   ├── admin/                       # [NEW] Reusable Admin CMS UI Components
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── UniversityForm.tsx
│   │   ├── FacultyModal.tsx
│   │   ├── ProgramModal.tsx
│   │   └── SuggestionReviewDialog.tsx
│   ├── layout/                      # Navbar, Footer
│   └── university/                  # Cards, Modal, Search
├── server/
│   ├── actions/
│   │   ├── admin.actions.ts         # [NEW] Admin mutations with revalidateTag
│   │   ├── university.actions.ts    # Public read & filter actions
│   │   └── suggestion.actions.ts    # Suggestion submission & approval
│   ├── services/
│   │   ├── AdminService.ts          # [NEW] Admin business rules & audits
│   │   ├── UniversityService.ts     # Public catalog query services
│   │   └── SearchIndexService.ts    # [NEW] Search index generation
│   ├── repositories/
│   │   ├── PostgresUniversityRepository.ts # [NEW] Normalized relational queries
│   │   ├── FallbackUniversityRepository.ts # [NEW] Static failover repository
│   │   ├── AuditLogRepository.ts    # [NEW] Immutable audit record writer
│   │   └── interfaces/              # [NEW] ISP-compliant reader/writer interfaces
│   └── mappers/
│       └── UniversityMapper.ts      # [NEW] DB Model -> Public DTO -> Slim Index
├── schemas/
│   ├── admin.schema.ts              # [NEW] Zod validation for admin inputs
│   └── university.schema.ts         # Domain Zod contracts
prisma/
├── schema.prisma                    # [EXPANDED] Fully normalized schema
├── etl/                             # [NEW] Automated Ingestion Pipeline
│   ├── seed-deep.ts                 # Ingests 5.24MB JSON into Postgres
│   ├── transform.ts                 # Normalizes scraped JSON
│   └── validate.ts                  # Zod validation pre-check
scripts/
└── generate-search-index.ts         # [NEW] CLI script to build public/search-index.json
```

---

## Phase Plan & Execution Strategy

### Phase 1: Normalized Database Schema & ETL Ingestion Pipeline
- Expand `prisma/schema.prisma` with `Faculty`, `DegreeProgram`, `Accreditation`, `AuditLog`, and extended `University` fields.
- Build `prisma/etl/seed-deep.ts` to ingest `Egyptian_Universities_Deep_Exhaustive_Database.json` with idempotent transactions and error logging.
- Run migration & ETL script against PostgreSQL database.

### Phase 2: Domain Services, Mappers, and Slim Client Index
- Implement `UniversityMapper` for DTO conversions and slim index tokens.
- Build `generate-search-index.ts` to generate `public/search-index.json` (~30 KB).
- Implement `IUniversityReader` and `IUniversityWriter` interfaces separating PostgreSQL operations from fallback storage.

### Phase 3: Admin CMS Panel (`/admin`) & Cache Invalidation
- Create protected `/admin` layout with BetterAuth role checks.
- Implement `/admin/universities` profile, faculty, and degree program management editors.
- Connect `admin.actions.ts` to execute `revalidateTag('universities')` and `revalidatePath()` upon every save.
- Implement `/admin/suggestions` moderation queue with one-click **"Approve & Apply"**.

### Phase 4: Verification, Testing, and Documentation
- Write Vitest unit tests for `AdminService`, `UniversityMapper`, and `PostgresUniversityRepository`.
- Verify on-demand cache revalidation and slim search index performance.
- Commit all changes and update project documentation.
