# Research & Architectural Decisions: Production Data Architecture & Admin CMS Suite

**Feature Branch**: `002-data-cms`  
**Date**: 2026-08-17  
**Status**: Completed  

---

## 1. Core Architectural Decisions

### Decision 1: Relational Normalized Schema in PostgreSQL vs. Monolithic Document Store

- **Decision**: Implement a fully normalized relational schema (`University` -> `Faculty` -> `DegreeProgram` -> `Accreditation` -> `AuditLog`) in PostgreSQL via Prisma 6 ORM.
- **Rationale**: 
  - The exhaustive dataset consists of nested, interrelated academic structures (faculties, degree programs, career prospects, dual-degree partners, tuition rates in EGP and USD).
  - Relational normalization enables exact SQL filtering (e.g., *Find all universities with Computer Engineering under 100K EGP in Cairo*), enforces foreign key cascades, prevents duplicate records, and simplifies atomic partial updates from the Admin CMS.
- **Alternatives Considered**:
  - *Storing entire university documents as raw JSONB columns*: Rejected because it prevents relational integrity checks, complicates partial nested edits (e.g., editing one degree program's tuition requires rewriting the entire JSON document), and prevents foreign key linkage with community suggestions.
  - *NoSQL (MongoDB / DynamoDB)*: Rejected because the platform is already standardized on PostgreSQL + Prisma with relational bookmarks and user sessions.

---

### Decision 2: Built-in Next.js 15 Admin CMS vs. Third-Party Headless CMS (Strapi / Sanity)

- **Decision**: Build an integrated Admin CMS inside the existing Next.js 15 App Router using Server Actions, Zod validation, and BetterAuth role-based access control (`/admin`).
- **Rationale**:
  - Zero external infrastructure dependencies or additional monthly hosting costs.
  - Seamless type-safety end-to-end: UI forms share exact Zod schemas with Server Actions and Prisma repositories.
  - Instant on-demand cache revalidation (`revalidateTag` / `revalidatePath`) happens directly in-process upon database commit, eliminating webhook latency or complex sync pipelines.
- **Alternatives Considered**:
  - *Strapi / Directus*: Adds Docker/Node service overhead, separate authentication systems, and webhook-based cache synchronization complexity.
  - *Sanity / Contentful*: Introduces recurring third-party API costs, external rate limits, and egress latency for core transactional university data.

---

### Decision 3: On-Demand Cache Invalidation Strategy

- **Decision**: Combine Next.js 15 Data Cache (`unstable_cache` with tagged cache keys) and On-Demand ISR (`revalidateTag('universities')`, `revalidatePath('/universities/[slug]')`).
- **Rationale**:
  - Public directory requests and profile views are cached at the Edge with high TTLs (1 hour default), delivering sub-50ms TTFB globally.
  - Whenever an administrator modifies tuition, faculty deans, or program details in `/admin`, the mutation Server Action executes `revalidateTag('universities')` and `revalidatePath()`, immediately purging stale edge caches and serving fresh data on the very next visit.
- **Alternatives Considered**:
  - *Pure SSR (no cache)*: Unnecessary database load on read-heavy public traffic (Egyptian students exploring admissions).
  - *Pure SSG (build-time static)*: Requires a full continuous deployment rebuild (3-5 minutes) for minor tuition adjustments.

---

### Decision 4: Tiered Client-Side Search Indexing (~30 KB Payload)

- **Decision**: Pre-compile a slim, minified search index (`public/search-index.json`, ~30 KB uncompressed, ~7 KB gzipped) containing only essential search tokens (`id`, `slug`, `nameEn`, `nameAr`, `shortName`, `emoji`, `city`, `model`, `majors[]`).
- **Rationale**:
  - Zero client memory bloat compared to bundling the 1.19 MB `database.js` or 7.17 MB `roadmaps_data.js`.
  - Enables instant, offline-capable autocomplete with sub-10ms response times directly in the browser.
  - Full relational details (faculties, departments, admissions, contact numbers) are fetched dynamically via Server Actions only when the student opens a specific profile modal.
- **Alternatives Considered**:
  - *Client-side Fuse.js over 5MB raw JSON*: Severely degrades mobile CPU and memory performance.
  - *Debounced API search on every keystroke*: Adds unnecessary network roundtrips and latency on mobile networks.

---

### Decision 5: Idempotent & Resilient Ingestion Pipeline (ETL)

- **Decision**: Implement a standalone TypeScript ingestion script (`prisma/etl/seed-deep.ts`) utilizing Prisma `$transaction`, Zod pre-validation, and `upsert` semantics keyed by institution `slug`.
- **Rationale**:
  - Ingests all 18,001 lines (5.24 MB) of `Egyptian_Universities_Deep_Exhaustive_Database.json` safely.
  - Idempotent execution allows safe re-runs against production or staging databases without corrupting existing records or duplicating foreign keys.
  - Pre-validates each institution record before insertion, streaming malformed records to an `etl-errors.jsonl` audit file while continuing pipeline execution.
- **Alternatives Considered**:
  - *Manual database entry*: Hundreds of hours of error-prone manual labor across 30+ universities and 400+ degree programs.
  - *Raw SQL dumps*: Fragile against schema migrations and type changes.

---

### Decision 6: Role-Based Authorization & Audit Trail

- **Decision**: Extend the BetterAuth User entity with a `role` enum (`STUDENT`, `EDITOR`, `ADMIN`, `SUPER_ADMIN`), guarded by Next.js middleware and Server Action permission decorators. Create an immutable `AuditLog` table.
- **Rationale**:
  - Ensures non-admin students cannot trigger administrative mutations.
  - Every administrative change (tuition edits, suggestion approvals, deletions) is permanently recorded with actor ID, timestamp, and before/after diff for complete operational governance.
