# Feature Specification: Production Data Architecture & Admin CMS Suite

| Field | Value |
|:---|:---|
| **Feature ID** | `002-data-cms` |
| **Branch** | `002-data-cms` |
| **Created** | 2026-08-17 |
| **Status** | Approved — Ready for Implementation |
| **Owner** | Platform Engineering |
| **Stakeholders** | Platform Admins, University Editors, Student End-Users, Data Operations Team |
| **Priority** | P0 — Foundational Blocker |

---

## 1. Problem Statement

The UniGate platform currently ships **8.36 MB of data as hardcoded JavaScript bundles** on every page load (`database.js` 1.19 MB, `roadmaps_data.js` 7.17 MB). This creates three critical business failures:

1. **Zero editability**: Any change to a university's tuition, faculty dean, or accreditation status requires a Git commit, CI/CD build, and full server redeployment — a minimum 5–10 minute outage window per data correction.
2. **Performance degradation**: An 8.36 MB initial client bundle causes 4–8 second Time-to-Interactive on mobile devices, failing Core Web Vitals and suppressing organic search discovery.
3. **No governance**: There is no audit trail of who changed what data, no community correction mechanism, and no structured access control for administrative operations.

This feature resolves all three failures in a single, cohesive architectural upgrade.

---

## 2. Goal

Migrate university data from static JavaScript bundles into a **normalized, live relational database**, operated through a **built-in Admin CMS portal** with **on-demand cache invalidation**, while reducing the initial client payload by **>95%** and establishing full **data governance and audit accountability**.

---

## 3. Scope

### In Scope
- Expanded Prisma relational schema: `University`, `Faculty`, `DegreeProgram`, `Accreditation`, `AuditLog`
- Idempotent ETL ingestion pipeline for the 5.24 MB exhaustive dataset
- Admin CMS portal (`/admin`): university lifecycle management, faculty/program editors, suggestion moderation queue, audit log viewer, JSON export
- Client-side slim search index (`public/search-index.json`, target ≤ 35 KB uncompressed)
- On-demand ISR cache revalidation (`revalidateTag`, `revalidatePath`) triggered on every admin mutation
- Role-Based Access Control (`STUDENT`, `EDITOR`, `ADMIN`, `SUPER_ADMIN`) via BetterAuth extension
- Community "Suggest Data Correction" pipeline linked to specific institutions

### Out of Scope (v1)
- Real-time collaborative editing (multi-cursor conflict resolution UI)
- Machine-learning-powered duplicate detection during ingestion
- Multi-language support beyond Arabic and English
- Image/media asset management
- Historical data versioning with full diff rollback UI

---

## 4. User Scenarios & Acceptance Criteria

### Story 1 — University Profile Lifecycle Management (Priority: P0)

**As** a platform administrator or authorized university data editor,
**I want** a visual, authenticated web dashboard to create, update, archive, and publish university institutional profiles, faculty divisions, and degree programs,
**So that** prospective students always access accurate academic and financial information — without any code deployment or engineering support.

**Why P0**: This is the foundational requirement. All other stories depend on data being editable and live.

**Independently testable**: An administrator logs in, edits a university tuition value, hits Save, and observes the change reflected on the public catalog immediately.

**Acceptance Criteria**:

| # | Given | When | Then | SLO |
|---|:---|:---|:---|:---|
| 1a | Authenticated ADMIN at `/admin/universities/[id]` | Updates annual tuition and clicks Save | Record persists; public catalog reflects updated value | < 2.0s from save to cache invalidation |
| 1b | Authenticated ADMIN adding a degree program | Submits bilingual name, faculty, duration, and tuition | New program appears under correct faculty in both AR and EN | Immediate on next public request |
| 1c | Authenticated ADMIN archiving a university | Clicks Archive | Institution hidden from public catalog, search index, compare tools — record retained | < 2.0s |
| 1d | Unauthenticated user or STUDENT role | Requests any `/admin/*` route | Redirect to authentication screen; 403 on Server Action invocation | Always |
| 1e | Two admins editing the same university concurrently | Second admin submits edit after first already saved | System detects `updatedAt` staleness; presents merge-or-overwrite dialog | Always |

---

### Story 2 — High-Performance Public Discovery & Search (Priority: P0)

**As** a high school student in Egypt browsing on mobile data,
**I want** instant university and major search with near-zero data consumption,
**So that** I can explore universities rapidly even on a 3G/4G connection.

**Why P0**: Directly tied to the platform's core value proposition. 8+ MB initial loads on mobile are a critical blocker for growth.

**Acceptance Criteria**:

| # | Given | When | Then | SLO |
|---|:---|:---|:---|:---|
| 2a | Student visits the homepage for the first time | Page loads | Total initial JS transfer ≤ 150 KB gzipped; `database.js` NOT shipped to client | Verified via Lighthouse |
| 2b | Student types in the search bar | At least 2 characters entered | Matching universities and degree programs appear in dropdown | < 50ms (client-side, no network) |
| 2c | Student clicks "View Details" on a university card | Modal opens | Full faculty hierarchy, accreditations, deans, contacts appear in selected language | < 800ms on 4G |
| 2d | Student returns within 1 hour | Cached page served | No database query executed; Edge-cached response delivered | < 50ms TTFB from CDN |

---

### Story 3 — Community Data Correction Pipeline (Priority: P1)

**As** a registered student who discovers an inaccurate tuition figure,
**I want** to submit a structured correction linked to that university's profile,
**So that** the data stays accurate through community contribution.

**As** an administrator,
**I want** a moderation inbox to review, verify, apply, or reject community suggestions in a single interaction,
**So that** corrections enter the live database with one click.

**Acceptance Criteria**:

| # | Given | When | Then | SLO |
|---|:---|:---|:---|:---|
| 3a | Registered student on a university profile | Submits a correction | Suggestion record created with status `PENDING`; visible in admin queue | Immediately |
| 3b | Admin in moderation queue | Clicks "Approve & Apply" | University record updated; suggestion status → `RESOLVED`; audit log created; cache invalidated | < 2.0s end-to-end |
| 3c | Admin rejects a suggestion | Clicks "Reject" | Suggestion status → `REJECTED`; no data change to university | Immediately |
| 3d | Unauthenticated user | Submits suggestion form | Request rejected with 401; no record created | Always |

---

### Story 4 — Automated ETL Ingestion Pipeline (Priority: P1)

**As** a platform data operations engineer,
**I want** an automated, idempotent, and validated ingestion pipeline that reads raw university JSON datasets,
**So that** initial population and periodic re-synchronization require a single command.

**Acceptance Criteria**:

| # | Given | When | Then | SLO |
|---|:---|:---|:---|:---|
| 4a | Raw 5.24 MB JSON dataset with 30+ universities | ETL pipeline runs for the first time | All entities inserted with correct FK relationships | < 30 seconds |
| 4b | Database already contains data | ETL pipeline re-runs | Existing records updated via upsert; zero duplicate rows | Idempotent |
| 4c | Dataset contains a malformed record | Pipeline encounters invalid record | Written to `etl-errors.jsonl`; pipeline continues to next record | Zero termination on partial failures |
| 4d | New university slug not previously seen | Pipeline encounters new institution | All nested entities inserted transactionally; partial inserts roll back on nested failure | Atomic per-institution |

---

### Story 5 — Audit Trail & Data Governance (Priority: P2)

**As** a lead platform administrator,
**I want** an immutable, chronological record of all administrative data changes,
**So that** every edit is traceable to a specific actor, timestamp, and data delta.

**Acceptance Criteria**:

| # | Given | When | Then | SLO |
|---|:---|:---|:---|:---|
| 5a | Admin performs any create, update, or delete operation | Action succeeds | `AuditLog` record created in same transaction: actor ID, email, entity type, entity ID, action, before state (JSON), after state (JSON), IP, timestamp | 100% of mutations — no exceptions |
| 5b | Admin views `/admin/audit-log` | Page loads | Paginated list filterable by entity type, action, actor, date range | < 500ms with 10K+ entries |
| 5c | Admin clicks "Export Database Snapshot" | Request processed | Structured JSON of all PUBLISHED universities with nested faculties and programs | < 5s for 50 universities |

---

### Story 6 — Read Resilience & Graceful Degradation (Priority: P2)

**As** a student browsing during a transient database connectivity failure,
**I want** the platform to display cached or fallback data rather than an error screen,
**So that** the user experience is uninterrupted by backend issues.

**Acceptance Criteria**:

| # | Given | When | Then | SLO |
|---|:---|:---|:---|:---|
| 6a | Primary PostgreSQL connection unavailable | Public catalog page requested | Fallback static dataset served transparently; no HTTP 500 surfaced | < 200ms failover |
| 6b | Database returns after reconnection | Next request made | Live database data resumes automatically | No operator action required |

---

### Edge Cases & Boundary Conditions

| Category | Scenario | Required Behavior |
|:---|:---|:---|
| **Concurrency** | Two admins save the same university within < 1 second | Second save detects `updatedAt` staleness; conflict resolution UI presented |
| **Ingestion — Invalid Tuition** | Degree program has `tuitionEgpPerYear: -5000` | Zod validation rejects record; logged to `etl-errors.jsonl`; institution continues |
| **Bilingual Fallback** | Admin saves a new field only in English | Arabic view renders English text transparently; no null render crash |
| **Slug Collision** | Two institutions resolve to same computed slug | Deterministic collision suffix appended (`guc-2`); logged as warning |
| **Large Export** | Export requested with 500+ universities | Response streams progressively; no full payload buffered in memory |

---

## 5. Functional Requirements

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-001 | System MUST persist entities in normalized hierarchy: `University → Faculty → DegreeProgram → Accreditation` | P0 |
| FR-002 | System MUST support bilingual (Arabic, English) attributes on all text-bearing entities | P0 |
| FR-003 | System MUST store annual tuition as integers (EGP, USD separately) enabling numerical range filtering | P0 |
| FR-004 | System MUST enforce RBAC with four roles: `STUDENT`, `EDITOR`, `ADMIN`, `SUPER_ADMIN` | P0 |
| FR-005 | System MUST provide protected Admin CMS portal with full CRUD for universities, faculties, degree programs, accreditations | P0 |
| FR-006 | System MUST perform on-demand cache invalidation within 2 seconds of any admin mutation | P0 |
| FR-007 | System MUST generate and maintain a static slim search index ≤ 35 KB uncompressed | P0 |
| FR-008 | System MUST deliver paginated public catalog pages with ≤ 150 KB total initial JS transfer | P0 |
| FR-009 | System MUST provide community Suggestion submission form linked to a specific university | P1 |
| FR-010 | System MUST provide admin suggestion moderation queue with single-action Approve & Apply | P1 |
| FR-011 | System MUST provide an idempotent ETL ingestion pipeline with upsert semantics | P1 |
| FR-012 | ETL pipeline MUST validate each record with Zod before insertion; errors streamed to separate log | P1 |
| FR-013 | System MUST write immutable `AuditLog` on every admin create, update, delete — in same DB transaction | P2 |
| FR-014 | Audit records MUST capture: actor ID, email, action, entity type, entity ID, before-state JSON, after-state JSON, timestamp | P2 |
| FR-015 | System MUST provide Admin audit log viewer with pagination and multi-field filtering | P2 |
| FR-016 | System MUST support on-demand JSON snapshot export of all published university data | P2 |
| FR-017 | System MUST fall back gracefully to static in-memory data when PostgreSQL is unreachable | P2 |
| FR-018 | System MUST detect concurrent edit conflicts using optimistic locking via `updatedAt` comparison | P2 |

---

## 6. Non-Functional Requirements

### 6.1 Performance SLOs

| Metric | Target | Measurement Method |
|:---|:---|:---|
| Admin Save → Cache Invalidation | < 2.0s | Server-side timing in admin actions |
| Public Catalog Initial JS Transfer | ≤ 150 KB gzipped | Lighthouse Network audit |
| Client Search Autocomplete Latency | < 50ms | `Performance.now()` delta in search hook |
| University Modal Fetch Latency | < 800ms on 4G simulated | Chrome DevTools throttling |
| Public Catalog TTFB (CDN-cached) | < 50ms | Vercel Analytics |
| ETL Full Run (18K lines) | < 30 seconds | Script exit-time log |
| Audit Log Page Load (10K entries) | < 500ms | Server Action response time |
| JSON Snapshot Export (50 universities) | < 5 seconds | Browser download initiation time |

### 6.2 Security Requirements

- All admin Server Actions MUST re-validate session role inside the Server Action body (defense-in-depth beyond middleware).
- `AuditLog` repository interface exposes ONLY `create()` — no update or delete method exists at any layer.
- ETL ingestion scripts are CLI-only tools; no HTTP endpoint shall invoke them.
- All database credentials loaded via `src/env.ts` with runtime validation; zero hardcoded credentials in source.

### 6.3 Type Safety Contract

- End-to-end type safety from Prisma-generated types → Zod-validated inputs → typed Server Action responses — zero `any` assertions.
- Raw Prisma model types MUST NOT leak to the client layer; all crossings enforced by explicit Mapper classes.
- Every Service class MUST depend on a Repository interface, not a concrete Prisma implementation.

### 6.4 Reliability

- `FallbackUniversityRepository` and `PostgresUniversityRepository` MUST be transparently interchangeable via `IUniversityRepository` — no `instanceof` checks or conditional branching in services.
- ETL transactions MUST be atomic per university; failure on nested entities rolls back only that institution and continues to the next.

---

## 7. Key Domain Entities

| Entity | Description |
|:---|:---|
| `University` | Top-level institution with full bilingual profile, rankings, contacts, social links, and publish status |
| `Faculty` | Academic division with bilingual name, dean, description, and department list |
| `DegreeProgram` | Individual degree offering with numeric tuition (EGP/USD), duration, language, career outcomes, dual-degree partner |
| `Accreditation` | External recognition record (ABET, RIBA, AACSB, NAQAAE, etc.) |
| `Suggestion` | Community correction proposal: `PENDING → RESOLVED / REJECTED` lifecycle |
| `AuditLog` | Immutable event record — INSERT-only; actor, action, entity, before/after JSON diff |
| `User` (extended) | Existing auth entity extended with `role` enum |

---

## 8. Success Criteria

| ID | Criterion | Target |
|:---|:---|:---|
| SC-001 | Admin data change → public page reflects update | < 2.0 seconds |
| SC-002 | Total initial client JS bundle reduction | From 8.36 MB → ≤ 150 KB (≥ 95% reduction) |
| SC-003 | Client-side search autocomplete response | < 50ms |
| SC-004 | Full ETL ingestion of 5.24 MB dataset | < 30 seconds; zero duplicates; zero FK violations |
| SC-005 | Audit trail completeness | 100% of admin mutations produce an audit record |
| SC-006 | Mobile Core Web Vitals | LCP < 2.5s, INP < 200ms, CLS < 0.1 — all Green |
| SC-007 | Concurrent edit conflict detection | 100% of concurrent saves to same entity trigger conflict warning |

---

## 9. Dependencies & Assumptions

### Dependencies
- PostgreSQL instance (Neon Serverless or Supabase) provisioned; `DATABASE_URL` set in environment.
- BetterAuth supports `role` field extension on the User model.
- Next.js 15.5+ `revalidateTag` and `revalidatePath` APIs available.

### Assumptions
- University logos and media continue to be served from `public/` or external CDN.
- Arabic and English are the only two languages in v1 scope.
- Raw JSON dataset available during one-time ETL execution; not committed to repository.


---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time University & Program Data Management (Priority: P1)

As a platform administrator or university admissions editor, I want to create, inspect, update, and publish university profiles, faculties, degree programs, and annual tuition rates through an intuitive visual dashboard, so that prospective students always have access to accurate, up-to-date academic and financial information without requiring software engineering interventions.

**Why this priority**: Directly solves the critical platform limitation where university data was static, hardcoded, and unmaintainable without code changes and full application redeployments.

**Independent Test**: An authorized administrator logs in, updates a university's tuition range and faculty dean details via the admin portal, saves changes, and immediately verifies that public-facing directory cards and profile modals reflect the updated values with zero server restarts.

**Acceptance Scenarios**:
1. **Given** an authenticated administrator on the university editor screen, **When** they update the annual tuition from 75,000 EGP to 85,000 EGP and click "Save Changes", **Then** the record is updated in the persistent datastore, and public search/catalog queries immediately serve the updated tuition.
2. **Given** an administrator adding a new degree program under an existing faculty, **When** they submit the bilingual name, study duration, degree type, and career prospects, **Then** the program appears nested under that faculty in both English and Arabic views.
3. **Given** an unauthenticated or non-admin user attempting to access the administration portal, **When** they request any management route, **Then** access is denied and they are redirected to a secure sign-in screen.

---

### User Story 2 - Instant Search & Low-Bandwidth Profile Delivery (Priority: P1)

As a high school student browsing university options on mobile data, I want instant search auto-completion across universities and majors with minimal cellular data consumption, so that I can explore programs rapidly even under low-connectivity conditions.

**Why this priority**: Eliminates multi-megabyte client bundle bloat, ensuring optimal Core Web Vitals, sub-second mobile page loads, and instantaneous discovery.

**Independent Test**: Load the marketing homepage and catalog on a throttled mobile network; verify that initial page payload is under 150 KB, search auto-complete responds in under 50ms, and complete faculty structures load on demand.

**Acceptance Scenarios**:
1. **Given** a visitor typing a major name (e.g., "Artificial Intelligence") into the search bar, **When** they type at least 2 characters, **Then** matching universities and specific programs are suggested instantly without full-page reloads or multi-megabyte payloads.
2. **Given** a visitor clicking "View Details" on any university card, **When** the modal opens, **Then** exhaustive faculty, dean, accreditation, and contact data are retrieved smoothly and displayed in the user's selected language.

---

### User Story 3 - Community Data Correction & Verification Pipeline (Priority: P2)

As a university student or faculty member who spots outdated admission criteria or tuition fees, I want to submit a structured correction with notes, and as an administrator, I want to review, compare, and merge or reject these suggestions with a single click.

**Why this priority**: Enables community-driven data accuracy and crowd-sourced verification, keeping hundreds of university programs accurate over time.

**Independent Test**: Submit a suggestion for a specific university as a registered user, review it in the admin moderation queue, approve the proposed changes, and verify the university profile is automatically updated.

**Acceptance Scenarios**:
1. **Given** a registered student reviewing a university profile, **When** they submit a correction noting a new accredited program, **Then** the suggestion is queued in the moderation inbox with status "Pending".
2. **Given** an administrator reviewing pending suggestions, **When** they click "Approve & Apply", **Then** the target university record updates automatically, the suggestion status transitions to "Resolved", and the submitting user is credited.

---

### User Story 4 - Automated Exhaustive Data Ingestion & Sync (Priority: P2)

As a platform operations engineer, I want an automated, idempotent ingestion pipeline that parses, validates, and normalizes large external datasets (containing 30+ universities, 400+ degree programs, deans, accreditations, and dual-degree partnerships) into structured records without manual data entry.

**Why this priority**: Allows immediate populating and periodic re-synchronization of exhaustive nationwide datasets while guaranteeing data integrity.

**Independent Test**: Execute the ingestion process against the raw dataset; verify that all entities, faculties, and degree programs are inserted/updated with zero duplicate records and zero validation errors.

**Acceptance Scenarios**:
1. **Given** an raw dataset containing nested faculties, deans, and degree programs, **When** the ingestion routine executes, **Then** all universities and their hierarchical relationships are persisted with relational integrity.
2. **Given** a re-run of the ingestion pipeline on an already populated database, **When** existing entities are encountered, **Then** the system updates existing records without generating duplicate identifiers or corrupting associations.

---

### User Story 5 - Operational Audit Logging & Snapshot Exports (Priority: P3)

As a lead platform administrator, I want a complete audit log of all data modifications and the ability to export full database snapshots in standard formats, so that administrative changes are accountable and backups can be taken at any time.

**Why this priority**: Provides governance, accountability, and offline portability for university datasets.

**Independent Test**: Perform several administrative updates, verify corresponding entries in the audit trail, and download a complete JSON snapshot.

**Acceptance Scenarios**:
1. **Given** an admin modifying a university profile, **When** the update succeeds, **Then** an immutable audit record is logged capturing the administrator identity, timestamp, modified fields, and previous values.
2. **Given** an admin requesting a data export, **When** they click "Export Database Snapshot", **Then** a structured export file containing all universities, faculties, and programs is generated for download.

---

### Edge Cases

- **Concurrent Admin Edits**: When two administrators edit the same university simultaneously, the system must detect version conflicts and warn the second administrator rather than silently overwriting changes.
- **Partial/Corrupted External Ingestion Records**: When the ingestion pipeline encounters a malformed record (e.g., missing mandatory name or negative tuition values), the system must log the invalid record to an error log, skip only that item, and continue processing remaining records.
- **Bilingual Field Fallback**: When an administrative record contains only English text for a newly added field, the Arabic user interface must cleanly display the available text without throwing runtime render errors.
- **Offline / Degraded Database State**: When the primary persistent datastore is temporarily unreachable, public read requests must gracefully serve cached or fallback data without displaying broken error screens.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a centralized relational datastore supporting hierarchical academic data: Institution -> Faculty -> Degree Program -> Career Outcomes.
- **FR-002**: System MUST support bilingual (Arabic and English) attributes for all text entities including institution names, overviews, faculty descriptions, and degree titles.
- **FR-003**: System MUST store annual tuition figures as structured numeric ranges (minimum/maximum in local and foreign currencies) to enable numerical filtering, comparison, and sorting.
- **FR-004**: System MUST provide role-based access control, restricting data mutation and administration endpoints exclusively to authorized administrator roles.
- **FR-005**: System MUST provide an administrative dashboard allowing authorized personnel to list, filter, search, create, edit, archive, and publish university profiles.
- **FR-006**: System MUST provide dedicated management interfaces for nested faculties (with deans and departments) and degree programs (with durations, degrees, tuition, and dual-degree partners).
- **FR-007**: System MUST automatically purge and update cached public representations immediately upon administrative data saves, achieving live updates without application rebuilds.
- **FR-008**: System MUST generate and maintain a lightweight client search index (under 40 KB payload) enabling zero-latency auto-complete on the client side.
- **FR-009**: System MUST support paginated data delivery for the public catalog, restricting initial server payload to under 150 KB per page view.
- **FR-010**: System MUST provide a public "Suggest Data Correction" submission mechanism linked to specific universities.
- **FR-011**: System MUST provide an administrative moderation queue to inspect, compare, approve, or reject community suggestions.
- **FR-012**: System MUST record immutable audit log entries for all administrative creation, modification, and deletion events.
- **FR-013**: System MUST provide an automated, idempotent ingestion utility to import raw exhaustive university JSON datasets into the relational schema.
- **FR-014**: System MUST allow administrators to export complete structured snapshots of university data on demand.
- **FR-015**: System MUST maintain operational read resiliency, falling back gracefully to static datasets if primary storage connection drops.

---

### Key Entities

- **University**: Represents a higher education institution with institutional attributes (bilingual names, slug, educational model, type, governorate, city, addresses, overview, rankings, contact information, social links, accreditation lists, publish status).
- **Faculty**: Represents an academic division or college within a university (bilingual names, descriptions, dean name, department listings).
- **DegreeProgram**: Represents a specific academic degree offered by a faculty or university (bilingual degree names, degree level, duration in years, study language, numeric annual tuition in EGP/USD, career opportunities, dual-degree international partner).
- **Accreditation**: Represents formal institutional or specialized programmatic accreditations (accreditation body name, recognition scope).
- **Suggestion**: Represents a crowdsourced data modification proposal submitted by a user against a target university (category, proposed changes, verification evidence, review status).
- **AuditLog**: Represents an immutable operational event (actor ID, target entity, action type, before/after payload, timestamp).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can update university profile data, tuition rates, or degree programs with changes reflected across public pages in **under 2 seconds** without code deployment.
- **SC-002**: Initial public page payload size is reduced from **>8.0 MB** to **<150 KB**, achieving a **95%+ reduction** in client-side data transfer.
- **SC-003**: Search auto-complete response time on client devices is **under 50ms** across all universities and majors.
- **SC-004**: Ingestion pipeline imports 30+ universities and 400+ degree programs in **under 30 seconds** with zero data loss or duplicate records.
- **SC-005**: 100% of administrative mutation events produce a verifiable audit trail record.
- **SC-006**: Public catalog and profile discovery achieve **100/100 Core Web Vitals** performance score on standard mobile audits.

---

## Assumptions

- **Authentication Infrastructure**: The platform's existing authentication system (BetterAuth) is leveraged to provide user identification and session management for administrative authorization.
- **Database Availability**: A PostgreSQL-compatible relational database is provisioned and accessible via standard connection pooling.
- **Language Support**: English and Arabic are the two primary languages required for all academic profiles; right-to-left (RTL) layout switching is fully handled by the existing design system.
- **Asset Hosting**: University logos and external media assets continue to be served via optimized web assets in `public/` or cloud storage buckets.

---

## Story 6 — Major Browsing: Precision Academic Discovery (Priority: P1)

**As** a student in Egypt who already knows their intended major or field of study,
**I want** to browse universities by academic discipline and see only institutions that
genuinely offer accredited programs in that field,
**So that** I can quickly narrow my university shortlist from 100+ institutions to my
final 3–5 candidates without wading through irrelevant results.

**Why P1**: Without precision matching, the Majors page shows 100+ universities for every
field (e.g. CS: 117 of 124) — making it functionally useless for decision-making. This
story restores the page to its intended utility as a precision browsing tool.

**Acceptance Criteria**:

| # | Given | When | Then | SLO |
|---|:---|:---|:---|:---|
| 6a | Student opens `/majors` | Page loads | All 19 major cards visible; university counts reflect only genuine academic offerings | < 1s (SSR) |
| 6b | Student expands "Computer Science" card | Click on card header | ≤ 40 universities shown (down from 117); only universities with CS faculty, CS dept, or CS degree program | Instant (pre-scored on mount) |
| 6c | Universities are listed inside a major card | Expanded state | Universities sorted by academic alignment confidence score, highest first | Pre-computed, 0ms |
| 6d | Student clicks "Private" filter chip | Inside expanded card | List instantly filters to private universities only; count badge updates; no page reload | < 1ms (sync) |
| 6e | Card has more than 6 matching universities | Expanded with > 6 results | Top 6 shown by default; "Show More (+N)" button reveals the rest with smooth animation | < 16ms |
| 6f | Student clicks "View in Directory" | Inside expanded card | Navigates to `/universities?search={majorName}` with full filter drawer | Standard navigation |
| 6g | Student types "صيدلة" in the search box | Arabic query | Pharmacy card surfaces; other cards that don't match are hidden | < 16ms (memoized) |
| 6h | Purely prose text contains academic words | e.g. overview says "information technology systems" | University does NOT match CS — only structural academic entities (faculties, departments, degree programs) qualify | Always |

**Success Metrics**:
- `SM-6.1`: CS returns ≤ 40 universities (from 117 baseline).
- `SM-6.2`: Psychology, Mechanical Engineering, Media Engineering show > 0 results.
- `SM-6.3`: A purely medical/dental university scores 0 against CS major.
- `SM-6.4`: Mount-time scoring computation completes in < 5ms.
