# Feature Specification: Production Database Reset & Verified Catalog Ingestion

**Feature Branch**: `004-prod-db-verified-reset`  
**Created**: 2026-09-04  
**Status**: Draft  
**Input**: User description: "Reset Our Production DB and Add Only The Verified Data we have rn which is only two Excel Files Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx & Ahleya_Universities_Cleaned_and_Organized.xlsx, using Production Grade best Practices, SOLID Principles and Industry Standards without Breaking any Other Features"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safe, Automated Production Reset & Verified Data Ingestion (Priority: P1)

As a Platform Lead and DevOps Engineer, I want an automated, repeatable, and transaction-bound operational pipeline that purges unverified legacy data and ingests only the 43 verified universities, 381 academic units, and 1,448 degree programs from the two authoritative Excel workbooks, so that the production database contains strictly verified, high-integrity educational data without manual errors.

**Why this priority**: Without this core data ingestion pipeline, the production database remains populated with unverified mock/scraped data, preventing the launch of legitimate student exploration and administrative workflows.

**Independent Test**: Can be fully tested by executing the reset and ingestion CLI script against a clean database, verifying that exactly 43 universities, 381 faculties, and 1,448 degree programs are inserted with zero relational errors.

**Acceptance Scenarios**:

1. **Given** a production database containing legacy/unverified records, **When** the reset protocol is initiated with confirmation flags, **Then** an immutable pre-reset snapshot (JSON + schema dump) is created before any deletion takes place.
2. **Given** the pre-reset snapshot succeeds, **When** the purge phase executes, **Then** all legacy catalog records (`University`, `Faculty`, `DegreeProgram`, `Accreditation`) and dependent orphaned records are safely removed while preserving system RBAC definitions and administrative users.
3. **Given** a purged database, **When** the ingestion engine processes both Excel workbooks, **Then** all 43 universities (24 private/international + 19 national Ahleya) and their hierarchical faculties and programs are committed atomically within a single transaction.
4. **Given** an unexpected validation error during ingestion, **When** any record fails schema constraints, **Then** the entire transaction aborts, rolls back all changes, and leaves the database in its verified pre-reset state.

---

### User Story 2 - Public Search, Exploration & Profile Continuity (Priority: P2)

As a prospective student or university explorer, I want to search, filter, and view the 43 verified universities, their faculties, and their degree programs on the UniGate web application, so that I can explore verified academic opportunities without encountering broken pages, missing translations, or 404 errors.

**Why this priority**: The public frontend is the primary value proposition of UniGate; ensuring that search indexing, filter tokens, and university profile pages render seamlessly with the newly ingested data is vital for user adoption.

**Independent Test**: Can be tested by navigating to `/`, `/universities`, `/majors`, and individual `/universities/[slug]` pages and asserting that cards, tags, filters, and program details render with HTTP 200 and zero runtime exceptions.

**Acceptance Scenarios**:

1. **Given** the verified data has been ingested, **When** a user visits `/universities`, **Then** all 43 verified institutions appear with their correct English and Arabic names, type badges (Private, National, etc.), and governorates.
2. **Given** a user navigates to an individual university page (e.g., `/universities/auc` or `/universities/asnu`), **When** the page loads, **Then** all associated faculties and degree programs are listed with their official names and types.
3. **Given** the search bar on `/` or `/majors`, **When** a user queries keywords (e.g., "Computer Science", "Medicine", "GUC"), **Then** matching verified programs and universities are returned instantly using updated search tokens.

---

### User Story 3 - Production Pre-Flight Backup & Disaster Recovery (Priority: P3)

As a DevOps Engineer / System Administrator, I want automated pre-flight snapshot generation and an instant rollback script, so that if any operational anomaly occurs post-deployment, production can be restored to its exact prior state within 5 minutes.

**Why this priority**: Production-grade safety requires disaster recovery guarantees before performing irreversible destructive operations.

**Independent Test**: Can be tested by simulating an aborted migration and running the recovery restore command to verify complete data restoration.

**Acceptance Scenarios**:

1. **Given** the ingestion process is triggered, **When** pre-flight runs, **Then** a timestamped archive containing SQL/JSON dumps and a SHA-256 manifest is saved to the persistent backup directory.
2. **Given** a post-ingestion failure is detected, **When** the rollback command is executed with the snapshot ID, **Then** the database state is completely restored and verified against the pre-flight checksum.

---

### User Story 4 - Admin Dashboard & RBAC Operational Stability (Priority: P4)

As a Content Editor or Platform Admin, I want the Unified Admin Dashboard to manage the newly ingested universities and programs under role-based access control, so that staff can update tuition, review suggestions, and publish edits without broken permissions or lost administrative access.

**Why this priority**: The administrative team needs continuous access to the catalog post-reset to manage ongoing university operations.

**Independent Test**: Can be tested by logging into the Admin Dashboard as Super Admin, viewing the 43 universities in the Catalog Manager, and updating a program detail.

**Acceptance Scenarios**:

1. **Given** the reset completes, **When** an admin logs in, **Then** their credentials and RBAC roles (`SUPER_ADMIN`, `ADMIN`, `CONTENT_EDITOR`) remain valid and functional.
2. **Given** an admin opens the Catalog Management interface, **When** viewing the catalog list, **Then** the 43 verified universities are visible with live completeness scores and status badges.

---

### Edge Cases

- What happens when a user had previously bookmarked an unverified university that is being purged during reset?  
  The system cleanly cascades the deletion of bookmarks pointing to non-existent universities, preventing foreign key constraint violations and orphaned dashboard widgets.
- How does the system handle missing non-mandatory fields in the Excel files (such as missing Arabic names, missing websites, or missing tuition figures)?  
  A deterministic bilingual enrichment dictionary maps canonical Arabic names, official websites, and governorate metadata for all 43 institutions; where Arabic program titles are absent, standardized bilingual translations or graceful transliterations are applied.
- How does the system prevent slug collisions across programs or faculties with similar names within or across universities?  
  Slugs for faculties and degree programs are deterministically scoped using university short codes and canonical program identifiers (e.g., `auc-computer-science`, `asnu-medicine`), guaranteed unique via composite index constraints.
- What happens if the ingestion pipeline crashes halfway through execution?  
  All database mutations occur inside a single ACID PostgreSQL transaction; if a crash or exception occurs, the transaction rolls back 100%, leaving the database in its pre-execution state.
- How are Next.js Static Site Generation (SSG) and Incremental Static Regeneration (ISR) caches handled post-reset?  
  The pipeline triggers automated Next.js cache revalidation tags (`revalidateTag('universities')`, `revalidatePath('/')`) and clears in-memory query caches to ensure stale data is never served to clients.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create an automated, verifiable pre-reset data snapshot (timestamped JSON dump and record manifest) prior to initiating any database purge.
- **FR-002**: System MUST support a controlled reset mode that purges all unverified educational catalog entities (`University`, `Faculty`, `DegreeProgram`, `Accreditation`) and cleans dependent orphaned records (`Bookmark`, `Suggestion`, `InstitutionAssignment`).
- **FR-003**: System MUST execute a Catalog-Scoped Reset that strictly preserves all existing registered user accounts (`User`), sessions (`Session`), linked provider accounts (`Account`), verification tokens (`Verification`), system roles (`Role`), permissions (`Permission`), role permissions (`RolePermission`), and administrative user role assignments (`UserRoleAssignment`). Only educational catalog tables (`University`, `Faculty`, `DegreeProgram`, `Accreditation`), institution assignments, and orphaned student interaction records (`Bookmark`, `Suggestion` pointing to deprecated universities) MUST be purged.
- **FR-004**: System MUST preserve and verify all system RBAC Roles (`SUPER_ADMIN`, `ADMIN`, `CONTENT_EDITOR`, `UNIVERSITY_REP`, `COMMUNITY_MODERATOR`, `STUDENT`) and standard Permission bindings as defined in the platform authorization specification.
- **FR-005**: System MUST parse both verified Excel workbooks (`Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx` and `Ahleya_Universities_Cleaned_and_Organized.xlsx`) using dedicated, decoupled parser components following the Single Responsibility Principle.
- **FR-006**: System MUST validate all raw workbook rows against strict schema definitions (types, non-empty identifiers, valid relationships) prior to database insertion, rejecting corrupt rows and logging discrepancies.
- **FR-007**: System MUST combine both datasets without duplication, resulting in exactly 43 verified universities (24 private/international + 19 national Ahleya).
- **FR-008**: System MUST ingest all 381 Academic Units mapped to their respective universities as `Faculty` records, preserving unit types (Faculty, School, College, Institute).
- **FR-009**: System MUST ingest all 1,448 Academic Offerings mapped to their responsible academic units as `DegreeProgram` records, linking canonical program categories where available.
- **FR-010**: System MUST generate deterministic, collision-free slugs for all universities, faculties, and degree programs using standard lowercase hyphenated formatting.
- **FR-011**: System MUST provide deterministic bilingual metadata (English and Arabic names, Egyptian Governorates, Education Models, University Types) using an audited enrichment dictionary for all 43 institutions.
- **FR-012**: System MUST execute the reset and ingestion sequence within an atomic database transaction with explicit timeout boundaries (>= 60s).
- **FR-013**: System MUST automatically invalidate all frontend ISR caches and in-memory caches upon successful ingestion completion.
- **FR-014**: System MUST execute an automated post-ingestion verification audit that checks row counts, referential integrity, and search token availability.
- **FR-015**: System MUST provide a rollback CLI command that can restore the pre-reset snapshot in case of deployment failure.

### Key Entities *(include if feature involves data)*

- **Verified University**: Root catalog entity representing an accredited Egyptian higher education institution. Attributes: `id`, `slug`, `shortName`, `nameEn`, `nameAr`, `type` (PRIVATE, NATIONAL, etc.), `educationModel`, `governorate`, `city`, `website`, `publishStatus`.
- **Academic Unit (Faculty)**: Intermediate academic division within an institution. Attributes: `id`, `universityId`, `nameEn`, `nameAr`, `departments`.
- **Academic Offering (Degree Program)**: Individual degree or specialization offered by a faculty. Attributes: `id`, `slug`, `universityId`, `facultyId`, `nameEn`, `nameAr`, `degreeType`, `durationYears`, `studyLanguage`.
- **Canonical Program & Field**: Standardized disciplinary taxonomy (e.g., Computing, Engineering, Medicine) mapped to offerings for cross-institutional exploration.
- **Pre-Reset Snapshot Manifest**: Immutable audit record containing timestamp, checksum, table row counts, and storage URI of the backup taken prior to reset.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the 43 verified universities, 381 academic units, and 1,448 degree programs from both Excel files are ingested into production PostgreSQL with zero dropped relations.
- **SC-002**: Zero referential integrity violations: 100% of faculties point to valid universities and 100% of degree programs point to valid universities and faculties.
- **SC-003**: The entire end-to-end reset, validation, and ingestion pipeline executes in under 90 seconds.
- **SC-004**: Pre-flight backup generation and verification completes in under 30 seconds prior to any data deletion.
- **SC-005**: 100% of public university exploration routes (`/`, `/universities`, `/majors`, `/universities/[slug]`) return HTTP 200 and render complete details for all 43 institutions.
- **SC-006**: Ingestion pipeline is 100% idempotent: running the ingestion script multiple times results in identical database counts and states.
- **SC-007**: Zero security or administrative regressions: Super Admin and staff credentials remain fully operational post-reset.

## Assumptions

- **Target Database**: PostgreSQL 16+ hosted on Neon Serverless with Prisma ORM 6+.
- **Authoritative Source**: The two Excel workbooks (`Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx` and `Ahleya_Universities_Cleaned_and_Organized.xlsx`) are the sole verified source of truth for universities, faculties, and offerings.
- **Bilingual Enrichment**: Because the Excel files are predominantly in English, standard canonical Egyptian governorates, education models, and Arabic university names will be enriched via an audited static dictionary.
- **Downtime Window**: The reset and ingestion operation will be executed during a brief scheduled maintenance window (or off-peak deployment) lasting under 3 minutes.
- **Cascade Behavior**: Legacy bookmarks and suggestions referencing deprecated mock universities will be safely pruned during the catalog reset.

---

## Architecture Review — Google Principal Engineer Audit

> **Audit Date**: 2026-09-04  
> **Reviewer Role**: Principal Software Engineer (Google SRE/Platform Engineering)  
> **Scope**: `TransactionalResetPipeline.ts` and all ETL orchestration code  
> **Verdict**: Functional — but not production-grade. Five critical vulnerabilities identified.

---

### Critical Vulnerability Findings

#### Finding 1 — Excessive Transaction Duration (Lock Starvation)

**Severity**: 🔴 P0 — Production Incident Risk

The current implementation holds an exclusive PostgreSQL write lock across all deletions and all batch inserts for the entire 44-second pipeline duration. On **Neon Serverless with PgBouncer**, this starves all concurrent read connections for the full window.

```
Current Design (DANGEROUS):
┌────────────────────────────────────────────────────────────────────────────┐
│  BEGIN TRANSACTION                                                         │
│  │                                                                         │
│  ├── deleteMany(Bookmark)      ~2s   ← exclusive lock held                │
│  ├── deleteMany(DegreeProgram) ~5s   ← exclusive lock held                │
│  ├── deleteMany(Faculty)       ~3s   ← exclusive lock held                │
│  ├── deleteMany(University)    ~2s   ← exclusive lock held                │
│  ├── createMany(Universities)  ~2s   ← exclusive lock held                │
│  ├── createMany(Faculties)     ~8s   ← exclusive lock held                │
│  └── createMany(Programs)     ~22s   ← exclusive lock held                │
│                                                                            │
│  COMMIT                        ~44s total exclusive lock                   │
└────────────────────────────────────────────────────────────────────────────┘
```

**Resolution**: Decouple deletion and ingestion into separate short-lived transactions. Use `pg_try_advisory_lock` as a distributed mutex to prevent concurrent invocations rather than relying on the transaction lock window.

---

#### Finding 2 — Dependency Inversion Principle (DIP) Violation

**Severity**: 🔴 P0 — Untestable in Isolation

The constructor instantiates concrete dependencies directly:

```typescript
// VIOLATION — constructor hard-codes concrete types
constructor(private prisma: PrismaClient) {
  this.snapshotManager  = new PostgresSnapshotManager(prisma);   // ← concrete
  this.cacheInvalidator = new NextCacheInvalidationService();     // ← concrete
  this.auditor          = new PostIngestionAudit(prisma);         // ← concrete
}
```

This makes the class impossible to unit-test without a live database and a running Next.js server.

**Resolution**: Invert dependencies — accept `ISnapshotManager`, `ICacheInvalidationService`, `IAuditService` interfaces via constructor injection.

---

#### Finding 3 — Missing Distributed Advisory Lock (Concurrent Invocation Race)

**Severity**: 🔴 P0 — Data Corruption Risk

Two concurrent CLI invocations (e.g., accidental double-click in a CI/CD pipeline or two engineers running simultaneously) would both pass the validation phase and begin executing the purge concurrently, leading to constraint violations, partial ingestion, or silent data corruption.

**Resolution**: Acquire `pg_try_advisory_lock(42891402)` (a fixed application-level lock key) as the very first step. If the lock cannot be acquired, abort immediately with a clear error. Release the lock unconditionally in a `finally` block.

---

#### Finding 4 — Missing Audit Log Entry (SOC2 / ISO 27001 Non-Compliance)

**Severity**: 🟠 P1 — Compliance Violation

The `AuditLog` model exists in the Prisma schema (`audit_logs` table) with fields `actorId`, `actorEmail`, `action`, `entityType`, `entityId`, `beforeState`, `afterState`. The current pipeline performs the most consequential destructive operation in the system lifecycle — a full catalog purge — **without writing a single audit log entry**.

Under SOC2 Type II and ISO 27001, every destructive bulk operation must be traceable to an actor, timestamp, and pre/post state diff.

**Resolution**: Add a `SystemAuditLogStep` that writes a structured `AuditLog` record after successful ingestion, capturing counts before/after, snapshot ID, and actor identity.

---

#### Finding 5 — Unstructured Console Logging (Unobservable in Production)

**Severity**: 🟠 P1 — SRE Observability Gap

All telemetry uses raw `console.log` with emoji decorations:

```typescript
console.log(`🚀 TRANSACTIONAL RESET & VERIFIED INGESTION PIPELINE`);
```

Cloud log aggregators (Datadog, Google Cloud Logging, AWS CloudWatch) parse JSON-structured log lines by field. Free-text emoji logs are unsearchable, cannot trigger alerts, and cannot be correlated with trace IDs.

**Resolution**: Replace all `console.log` calls with a `StructuredLogger` that emits newline-delimited JSON with `{ level, timestamp, step, message, ...context }`.

---

### Redesigned Architecture — Enterprise SOLID Design Patterns

#### Design Patterns Applied

| Pattern | Role |
|---|---|
| **Pipeline / Chain of Responsibility** | Each `IPipelineStep` is independent; the orchestrator chains them in order |
| **Unit of Work** | Each step encapsulates its own transaction boundary (short-lived) |
| **Strategy** | Steps are swappable implementations behind `IPipelineStep<TContext>` |
| **Dependency Injection** | All collaborators are injected via constructor — zero `new` inside classes |
| **Saga / Compensation** | Each step declares a `compensate()` hook; orchestrator calls them in reverse on failure |

#### Pipeline Step Architecture

```
TransactionalResetPipeline (Orchestrator — DI-injected)
│
├── Step 1: AdvisoryLockStep
│     execute()     → SELECT pg_try_advisory_lock(42891402)  [abort if false]
│     compensate()  → SELECT pg_advisory_unlock(42891402)    [always release]
│
├── Step 2: PreflightSnapshotStep
│     execute()     → ISnapshotManager.createSnapshot()      [JSON + SHA-256]
│     compensate()  → log only (snapshot is immutable artifact)
│
├── Step 3: CatalogResetAndIngestionStep
│     execute()     → Short TX: deleteMany() catalog tables
│                  → Short TX: createMany() universities / faculties / programs
│     compensate()  → ISnapshotManager.restoreSnapshot(ctx.snapshotId)
│
├── Step 4: PostIngestionAuditStep
│     execute()     → IAuditService.runAudit()               [row counts + FK check]
│     compensate()  → log only
│
├── Step 5: SystemAuditLogStep
│     execute()     → prisma.auditLog.create({ action: 'CATALOG_RESET', ... })
│     compensate()  → log only
│
└── Step 6: CacheInvalidationStep
      execute()     → ICacheInvalidationService.invalidateCatalogCaches()
      compensate()  → log only (cache invalidation is best-effort)
```

---

### `IPipelineStep<TContext>` Interface Contract

```typescript
// PipelineLogger — SRE structured telemetry (JSON-parseable)
export interface PipelineLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

// PipelineContext — shared mutable state bag passed through every step
export interface PipelineContext {
  prisma:       PrismaClient;
  logger:       PipelineLogger;
  validatedData: { universities: ValidatedUniversity[]; faculties: ValidatedFaculty[]; programs: ValidatedProgram[]; };
  options:      { dryRun: boolean; skipSnapshot: boolean; skipRevalidation: boolean; };
  // mutable outputs written by steps
  snapshotId?:          string;
  advisoryLockHeld?:    boolean;
  universitiesIngested?: number;
  facultiesIngested?:    number;
  programsIngested?:     number;
  auditPassed?:          boolean;
}

// IPipelineStep<TContext> — the core interface every step must implement
export interface IPipelineStep<TContext extends PipelineContext = PipelineContext> {
  readonly name: string;
  execute(ctx: TContext):     Promise<void>;  // throws on failure
  compensate?(ctx: TContext): Promise<void>;  // must not throw — swallow and log
}
```

---

### `StructuredLogger` Implementation Spec

```typescript
// SRE-grade JSON logger — output format parseable by Datadog / GCP / CloudWatch
class StructuredLogger implements PipelineLogger {
  constructor(private readonly component = "TransactionalResetPipeline") {}

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      component: this.component,
      message,
      ...context,
    };
    process.stdout.write(JSON.stringify(entry) + "\n");
  }

  info(message: string, context?: Record<string, unknown>): void { this.emit("INFO",  message, context); }
  warn(message: string, context?: Record<string, unknown>): void { this.emit("WARN",  message, context); }
  error(message: string, context?: Record<string, unknown>): void { this.emit("ERROR", message, context); }
}
```

---

### Step Specifications

#### `AdvisoryLockStep`
- **Concern**: Distributed mutual exclusion — prevents concurrent pipeline invocations
- **Lock Key**: `42891402` (application-specific PostgreSQL advisory lock constant)
- **execute()**: Runs `SELECT pg_try_advisory_lock(42891402)` via `prisma.$queryRaw`. If result is `false`, throws `Error("Pipeline already running — advisory lock not acquired")`. Sets `ctx.advisoryLockHeld = true`.
- **compensate()**: Runs `SELECT pg_advisory_unlock(42891402)`. Also invoked unconditionally in the orchestrator `finally` block. Must swallow errors.
- **Timeout**: Immediate (non-blocking `pg_try_advisory_lock`, not `pg_advisory_lock`)

#### `PreflightSnapshotStep`
- **Concern**: Immutable disaster-recovery artifact creation before any destructive operation
- **execute()**: Calls `ISnapshotManager.createSnapshot()`. Writes `ctx.snapshotId` with the returned manifest ID. Logs manifest SHA-256 and storage path.
- **compensate()**: No-op (snapshot is an immutable artifact — leaving it is the safe choice).
- **Skip condition**: `ctx.options.skipSnapshot === true`

#### `CatalogResetAndIngestionStep`
- **Concern**: Atomic catalog purge + verified data ingestion
- **Purge transaction**: Short, bounded `$transaction` deleting `Bookmark`, `Suggestion`, `DegreeProgram`, `Faculty`, `Accreditation`, `InstitutionAssignment`, `University` — in FK-safe order.
- **Ingestion transaction**: Separate `$transaction` inserting all universities, faculties, and degree programs (chunked at 200). Builds `uniIdMap` and `unitIdMap` for relational integrity.
- **compensate()**: Calls `ISnapshotManager.restoreSnapshot(ctx.snapshotId)` to restore pre-reset state.
- **Timeout**: 120 000 ms per transaction

#### `PostIngestionAuditStep`
- **Concern**: Post-commit data integrity verification
- **execute()**: Calls `IAuditService.runAudit()`. Sets `ctx.auditPassed = true`. Throws if audit fails.
- **compensate()**: Log-only.

#### `SystemAuditLogStep`
- **Concern**: SOC2 / ISO 27001 compliance — mandatory structured audit trail
- **execute()**: Writes to `prisma.auditLog.create()` with:
  - `action: "CATALOG_RESET"`
  - `entityType: "University"`
  - `entityId: "BULK"`
  - `afterState: { universitiesIngested, facultiesIngested, programsIngested, snapshotId }`
  - `actorId` and `actorEmail` sourced from environment or CLI flags
- **compensate()**: Log-only (audit entries are never rolled back).

#### `CacheInvalidationStep`
- **Concern**: Stale frontend data eviction
- **execute()**: Calls `ICacheInvalidationService.invalidateCatalogCaches()`.
- **compensate()**: Log-only (cache invalidation is best-effort, never a blocker).
- **Skip condition**: `ctx.options.skipRevalidation === true`

---

### Orchestrator Compensation Protocol

```
Pipeline Execution with Saga Compensation:

  steps = [LockStep, SnapshotStep, ResetStep, AuditStep, SysLogStep, CacheStep]
  executed = []

  for each step in steps:
    try:
      await step.execute(ctx)
      executed.push(step)
    catch error:
      logger.error("Step failed — triggering compensation", { step: step.name, error })
      for each completedStep in reverse(executed):
        await completedStep.compensate?.(ctx)     ← saga reversal
      throw error  ← propagate to CLI for non-zero exit

  finally:
    await advisoryLockStep.compensate(ctx)         ← ALWAYS release lock
```

---

### Architecture Comparison Matrix

| Dimension | Current (Monolithic) | PRE Standard (SOLID Pipeline) |
|---|---|---|
| **Lock Duration** | ~44s exclusive transaction | Advisory lock only; two short transactions |
| **DIP Compliance** | ❌ `new` concrete types in constructor | ✅ Injected interfaces |
| **Concurrent Safety** | ❌ No mutex — data corruption risk | ✅ `pg_try_advisory_lock` distributed mutex |
| **Audit Trail** | ❌ No `audit_logs` entry | ✅ `SystemAuditLogStep` writes SOC2 record |
| **Observability** | ❌ `console.log` + emoji | ✅ JSON-structured `StructuredLogger` |
| **Testability** | ❌ Requires live DB + Next.js | ✅ Mock interfaces per step in isolation |
| **Compensation** | ❌ Single rollback point | ✅ Per-step saga `compensate()` hooks |

---

### Principal-Grade SRE Runbook

#### Stage 0 — Pre-Execution Checklist
```
[ ] Confirm maintenance window communicated to stakeholders
[ ] Verify both Excel source files are present and checksums match
[ ] Confirm DATABASE_URL points to correct production environment
[ ] Confirm no other pipeline invocations are active (pg_stat_activity check)
[ ] Create manual PgBouncer session with SHOW POOLS to confirm no pending queries
```

#### Stage 1 — Dry Run Validation
```bash
npx tsx prisma/etl/reset-verified-catalog.ts --dry-run
```
```
Expected output:
  ✔ Schema validation: 43 universities, 381 faculties, 1448 programs
  ✔ Advisory lock: acquirable
  ✔ Dry run complete — zero modifications
```

#### Stage 2 — Backup Verification
```bash
npx tsx prisma/etl/reset-verified-catalog.ts --backup-only
```
```
Expected output:
  ✔ Snapshot created: snapshot-<timestamp>
  ✔ SHA-256 manifest verified
  ✔ Snapshot path: backups/snapshot-<timestamp>/
```

#### Stage 3 — Production Reset (Supervised)
```bash
npx tsx prisma/etl/reset-verified-catalog.ts --confirm-production
```
```
Monitor:
  - Advisory lock acquired within 2s
  - Purge transaction completes < 15s
  - Ingestion transaction completes < 60s
  - Post-ingestion audit: PASSED
  - audit_logs entry written
  - Cache invalidation: OK
```

#### Stage 4 — Post-Reset Verification
```bash
# Verify counts
npx tsx -e "const p = new PrismaClient(); console.log(await p.university.count())"

# Verify search index
curl https://<production-url>/api/search?q=auc

# Verify admin access
curl -H "Cookie: ..." https://<production-url>/api/admin/universities
```

#### Stage 5 — Rollback (If Anomaly Detected)
```bash
# SLA: < 60 seconds to restore
npx tsx prisma/etl/reset-verified-catalog.ts --rollback snapshot-<timestamp>
```
```
Expected output:
  ✔ Snapshot SHA-256 verified
  ✔ Catalog tables restored from JSON dump
  ✔ Row counts verified against manifest
  ✔ Rollback complete
```

---

### Disaster Recovery & Rollback SLA

| Metric | Target |
|---|---|
| Snapshot creation time | < 30 seconds |
| Full rollback execution time | < 60 seconds |
| Data loss on rollback | Zero (point-in-time snapshot) |
| Advisory lock acquisition | < 2 seconds (non-blocking) |
| Concurrent invocation safety | Guaranteed (advisory mutex) |
| SOC2 audit trail | Every reset recorded in `audit_logs` |

---

### Additional Non-Functional Requirements (PRE Additions)

- **NFR-001**: The pipeline MUST acquire a PostgreSQL advisory lock (`pg_try_advisory_lock(42891402)`) before any database mutation and release it unconditionally in a `finally` block.
- **NFR-002**: All structured log output MUST be newline-delimited JSON parseable by cloud log aggregators (Datadog, Google Cloud Logging).
- **NFR-003**: Every pipeline execution — successful or failed — MUST write a record to the `audit_logs` table with action `CATALOG_RESET` and before/after state counts.
- **NFR-004**: All step dependencies (`ISnapshotManager`, `ICacheInvalidationService`, `IAuditService`) MUST be injected as interfaces — no `new` concrete instantiation inside class constructors.
- **NFR-005**: Each `IPipelineStep` MUST declare a `compensate()` hook that the orchestrator calls in reverse order on any step failure (saga compensation pattern).
- **NFR-006**: The purge phase and the ingestion phase MUST be executed in two separate, short-lived database transactions rather than a single 44-second monolithic transaction.
- **NFR-007**: The system MUST reject concurrent invocations with a clear error message: `"Pipeline already running — advisory lock not acquired (key: 42891402)"`.

