# Implementation Plan: Production Data Architecture & Admin CMS Suite

**Branch**: `002-data-cms` | **Date**: 2026-08-17 | **Spec**: [specs/002-data-cms/spec.md](spec.md)  
**Input**: Feature specification from `specs/002-data-cms/spec.md`

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
