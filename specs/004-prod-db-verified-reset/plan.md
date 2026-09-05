# Implementation Plan: Production Database Reset & Verified Catalog Ingestion

| Field | Value |
|:---|:---|
| **Feature ID** | `004-prod-db-verified-reset` |
| **Branch** | `004-prod-db-verified-reset` |
| **Date** | 2026-09-04 |
| **Spec** | [spec.md](spec.md) |
| **Research** | [research.md](research.md) |
| **Data Model** | [data-model.md](data-model.md) |
| **Quickstart** | [quickstart.md](quickstart.md) |
| **Architecture Review** | [spec.md § Architecture Review](spec.md#architecture-review--google-principal-engineer-audit) |
| **Status** | Ready for Implementation |

---

## 1. Executive Summary

This plan outlines the production-grade engineering strategy to reset the UniGate production database and atomically ingest strictly verified higher education data from two authoritative Excel workbooks:

1. `Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx` (24 Private & International Universities)
2. `Ahleya_Universities_Cleaned_and_Organized.xlsx` (19 National Ahleya Universities)

Following **Google Principal Engineer standards** and **SOLID architecture**, this feature executes a **Catalog-Scoped Reset** that eliminates all mock, unverified, or corrupted legacy data while strictly preserving registered user accounts, active sessions, and dynamic RBAC role assignments.

A Google Principal Engineer audit of the original monolithic design identified **five critical production vulnerabilities** (P0: lock starvation, DIP violation, missing distributed mutex; P1: missing audit log, unstructured logging). The implementation plan below reflects the **redesigned SOLID pipeline** that resolves all five.

**Target Scope**: Exactly **43 Universities**, **381 Academic Units (Faculties)**, and **1,448 Degree Programs** committed with zero orphaned foreign keys and zero breaking changes to public search or admin workflows.

---

## 2. Technical Context

| Component | Technology / Library | Version / Constraint |
|:---|:---|:---|
| **Language** | TypeScript (Strict Mode) | 5.8+ |
| **Runtime** | Node.js | 20 LTS / 24 LTS |
| **Framework** | Next.js App Router | 15.x |
| **ORM** | Prisma | 6.4.x |
| **Database** | PostgreSQL 16+ | Neon Serverless + PgBouncer |
| **Workbook Parser** | `xlsx` (SheetJS) | ^0.18.5 |
| **Schema Validation** | `zod` | 3.24+ |
| **Test Runner** | `vitest` | 3.2+ |
| **Advisory Lock Key** | `pg_try_advisory_lock` | Key: `42891402` |
| **Performance Target** | Full reset & ingestion under 90s; pre-flight backup under 30s |
| **Compliance Target** | SOC2 / ISO 27001 — every reset recorded in `audit_logs` |

---

## 3. PRE-Standard Architecture: SOLID Pipeline Design

The original monolithic `TransactionalResetPipeline` has been redesigned as an enterprise **Pipeline / Chain of Responsibility** with saga-style compensation. All dependencies are injected via interfaces (DIP). Each step is a bounded unit of work with its own `execute()` and optional `compensate()` hook.

```
+-------------------------------------------------------------------------+
|                       CLI / OPERATIONAL ENTRY                           |
|        prisma/etl/reset-verified-catalog.ts (--confirm-production)      |
+-------------------------------------------------------------------------+
                                     |
+-------------------------------------------------------------------------+
|                      PARSING & NORMALIZATION LAYER                      |
|      ExcelWorkbookParser (IWorkbookParser) → raw row DTOs               |
|      BilingualEnrichmentProvider (IEnrichmentProvider) → Arabic/Gov     |
|      CatalogValidator → Zod schema, slug dedup, FK pre-checks           |
+-------------------------------------------------------------------------+
                                     |
                         ValidationReport passed to:
                                     |
+-------------------------------------------------------------------------+
|            TRANSACTIONAL RESET PIPELINE  (Orchestrator — DI)           |
|                                                                         |
|  Step 1: AdvisoryLockStep                                               |
|          pg_try_advisory_lock(42891402) → abort if false                |
|          compensate() → pg_advisory_unlock(42891402) [always]           |
|                                                                         |
|  Step 2: PreflightSnapshotStep                                          |
|          ISnapshotManager.createSnapshot() → JSON + SHA-256 manifest    |
|          compensate() → log only (snapshot is immutable artifact)       |
|                                                                         |
|  Step 3: CatalogResetAndIngestionStep                                   |
|          TX-A (short): deleteMany() catalog tables in FK-safe order     |
|          TX-B (short): createMany() 43 unis → 381 faculties → 1448 prg  |
|          compensate() → ISnapshotManager.restoreSnapshot(snapshotId)    |
|                                                                         |
|  Step 4: PostIngestionAuditStep                                         |
|          IAuditService.runAudit() → row counts + orphan FK check        |
|          compensate() → log only                                        |
|                                                                         |
|  Step 5: SystemAuditLogStep  ← NEW (SOC2 / ISO 27001)                  |
|          prisma.auditLog.create({ action: 'CATALOG_RESET', ... })       |
|          compensate() → log only (audit entries never rolled back)      |
|                                                                         |
|  Step 6: CacheInvalidationStep                                          |
|          ICacheInvalidationService.invalidateCatalogCaches()            |
|          compensate() → log only (best-effort)                          |
|                                                                         |
|  finally: advisoryLockStep.compensate() → ALWAYS releases lock          |
+-------------------------------------------------------------------------+
```

### Key Architecture Decisions

| Dimension | Decision | Rationale |
|:---|:---|:---|
| **Distributed Mutex** | `pg_try_advisory_lock(42891402)` | Prevents concurrent invocations corrupting data on Neon/PgBouncer |
| **Split Transactions** | TX-A (purge) + TX-B (ingest) | Reduces exclusive lock hold time from ~44s to two short windows |
| **Saga Compensation** | Per-step `compensate()` hooks in reverse | Enables precise partial rollback without a single 44s lock window |
| **DI / Interface Injection** | `ISnapshotManager`, `ICacheInvalidationService`, `IAuditService` | Full unit-testability without a live database or running Next.js |
| **StructuredLogger** | JSON newline-delimited output | Parseable by Datadog, GCP Cloud Logging, AWS CloudWatch |
| **SystemAuditLogStep** | Writes to `prisma.auditLog` | SOC2 Type II / ISO 27001 mandatory destructive-op audit trail |

---

## 4. File Map

### New Files (to be created)

| File | Responsibility |
|:---|:---|
| `src/server/etl/interfaces/IPipelineStep.ts` | `IPipelineStep<TContext>`, `PipelineContext`, `PipelineLogger` interface contracts |
| `src/server/etl/interfaces/IWorkbookParser.ts` | Row DTOs + `IWorkbookParser` interface |
| `src/server/etl/interfaces/ISnapshotManager.ts` | `SnapshotManifest` + `ISnapshotManager` interface |
| `src/server/etl/interfaces/IEnrichmentProvider.ts` | `UniversityEnrichmentRecord` + `IEnrichmentProvider` interface |
| `src/server/etl/ExcelWorkbookParser.ts` | SheetJS workbook adapter implementing `IWorkbookParser` |
| `src/server/etl/BilingualEnrichmentProvider.ts` | Audited dictionary for all 43 institutions |
| `src/server/etl/CatalogValidator.ts` | Zod validation, slug generation, bilingual faculty dictionary |
| `src/server/etl/PostgresSnapshotManager.ts` | Pre-reset JSON snapshot + SHA-256 manifest, rollback |
| `src/server/etl/SnapshotRollbackService.ts` | Wraps `PostgresSnapshotManager.restoreSnapshot()` |
| `src/server/etl/TransactionalResetPipeline.ts` | **SOLID pipeline orchestrator** (refactored — see Phase 3) |
| `src/server/etl/NextCacheInvalidationService.ts` | ISR tag revalidation + search cache flush |
| `src/server/etl/PostIngestionAudit.ts` | Row count & orphan-key integrity audit |
| `prisma/etl/reset-verified-catalog.ts` | Enterprise CLI (`--dry-run`, `--confirm-production`, `--backup-only`, `--rollback <id>`, `--list-backups`) |
| `tests/unit/etl/parser.test.ts` | Unit tests for `ExcelWorkbookParser` |
| `tests/unit/etl/validator.test.ts` | Unit tests for `CatalogValidator` |

---

## 5. Implementation Phases

### Phase 1 — Ingestion Engine & SOLID Components

Build the parsing, enrichment, and validation layer. Each component implements a single interface (SRP + ISP).

- `ExcelWorkbookParser.ts` → implements `IWorkbookParser`
- `BilingualEnrichmentProvider.ts` → implements `IEnrichmentProvider` with canonical metadata dictionary for all 43 institutions (Arabic names, governorates, education models, types)
- `CatalogValidator.ts` → Zod schema validation, deterministic slug generation, bilingual faculty name dictionary, `ValidationReport` output
- Unit tests: `tests/unit/etl/parser.test.ts`, `tests/unit/etl/validator.test.ts`

---

### Phase 2 — Pre-Flight Snapshot & Disaster Recovery

Build the immutable disaster-recovery layer before any destructive operation executes.

- `PostgresSnapshotManager.ts` → implements `ISnapshotManager`
  - Creates timestamped JSON dump of all catalog tables + row-count manifest
  - Writes SHA-256 checksum of each table dump
  - Exports to `backups/snapshot-<timestamp>/`
- `SnapshotRollbackService.ts` → wraps `PostgresSnapshotManager.restoreSnapshot(snapshotId)`
- CLI flag `--backup-only` triggers snapshot creation only, without any reset
- CLI flag `--rollback <snapshotId>` verifies checksum then restores

---

### Phase 3 — SOLID TransactionalResetPipeline Refactor *(critical change from original design)*

Refactor `TransactionalResetPipeline.ts` from a monolithic class into a **DI-injected SOLID pipeline orchestrator** composed of six discrete `IPipelineStep` implementations.

#### 3a. Define `IPipelineStep<TContext>` Interface Contract
File: `src/server/etl/interfaces/IPipelineStep.ts`

```typescript
export interface IPipelineStep<TContext extends PipelineContext = PipelineContext> {
  readonly name: string;
  execute(ctx: TContext):     Promise<void>;  // throws on failure
  compensate?(ctx: TContext): Promise<void>;  // must not throw — swallow and log
}
```

#### 3b. Implement `StructuredLogger`
Replace all `console.log` calls with JSON-structured output:
```typescript
// Output: {"level":"INFO","timestamp":"...","step":"AdvisoryLockStep","message":"..."}
```

#### 3c. Implement Each Step

| Step | File location | Key behaviour |
|:---|:---|:---|
| `AdvisoryLockStep` | inside `TransactionalResetPipeline.ts` | `pg_try_advisory_lock(42891402)` — abort if false; `compensate()` always unlocks |
| `PreflightSnapshotStep` | inside `TransactionalResetPipeline.ts` | Delegates to `ISnapshotManager`; skipped if `skipSnapshot` flag set |
| `CatalogResetAndIngestionStep` | inside `TransactionalResetPipeline.ts` | **TX-A**: purge in FK-safe order; **TX-B**: insert 43 unis → 381 faculties → 1448 programs (chunked at 200); `compensate()` calls `ISnapshotManager.restoreSnapshot()` |
| `PostIngestionAuditStep` | inside `TransactionalResetPipeline.ts` | Delegates to `IAuditService`; throws on failure |
| `SystemAuditLogStep` | inside `TransactionalResetPipeline.ts` | `prisma.auditLog.create({ action: 'CATALOG_RESET', entityType: 'University', entityId: 'BULK', afterState: { counts, snapshotId } })` |
| `CacheInvalidationStep` | inside `TransactionalResetPipeline.ts` | Delegates to `ICacheInvalidationService`; skipped if `skipRevalidation` flag set |

#### 3d. Implement Orchestrator with Saga Compensation

```
steps = [LockStep, SnapshotStep, ResetStep, AuditStep, SysLogStep, CacheStep]
executed = []
try:
  for step of steps:
    await step.execute(ctx)
    executed.push(step)
catch error:
  for step of reverse(executed):
    await step.compensate?.(ctx)
  throw error
finally:
  await lockStep.compensate(ctx)   // ALWAYS releases advisory lock
```

---

### Phase 4 — Cache Invalidation & Search Index Sync

- `NextCacheInvalidationService.ts` triggers:
  - `revalidateTag('universities')`
  - `revalidatePath('/')`
  - Rebuilds `SlimSearchToken` data in `CachedUniversityRepository`
  - Writes updated `public/search-index.json`

---

### Phase 5 — Automated Verification Suite

Post-ingestion integrity audit (`PostIngestionAudit.ts`):
- Exactly 43 published universities
- Exactly 381 faculties
- Exactly 1,448 degree programs
- Zero orphan degree programs or faculties (FK integrity check)
- `audit_logs` entry exists for the current reset execution

---

### Phase 6 — Production Runbook Execution

Follow the SRE Runbook defined in [spec.md § Principal-Grade SRE Runbook](spec.md#principal-grade-sre-runbook):

| Stage | Command | Expected result |
|:---|:---|:---|
| 0 | Pre-execution checklist | Stakeholders notified; source files checksummed; no active pg sessions |
| 1 | `--dry-run` | 43/381/1448 validated; advisory lock acquirable; zero DB modifications |
| 2 | `--backup-only` | Snapshot created; SHA-256 verified; stored in `backups/` |
| 3 | `--confirm-production` | Full pipeline; all 6 steps green; `audit_logs` entry written |
| 4 | Manual verification | `/universities` → 43 cards; search → results; admin → RBAC intact |
| 5 | `--rollback <id>` (if needed) | Restored in < 60s; row counts match manifest checksum |

---

## 6. Non-Functional Requirements (PRE Additions)

| ID | Requirement |
|:---|:---|
| **NFR-001** | Advisory lock `pg_try_advisory_lock(42891402)` MUST be acquired before any mutation; released unconditionally in `finally` |
| **NFR-002** | All log output MUST be newline-delimited JSON parseable by cloud log aggregators |
| **NFR-003** | Every execution MUST write a `CATALOG_RESET` record to `audit_logs` with before/after counts |
| **NFR-004** | All collaborators injected as interfaces — zero `new` inside class constructors |
| **NFR-005** | Each `IPipelineStep` MUST implement a `compensate()` hook; orchestrator calls them in reverse on any failure |
| **NFR-006** | Purge and ingestion MUST be separate short-lived transactions (not one 44s lock window) |
| **NFR-007** | Concurrent invocations MUST be rejected: `"Pipeline already running — advisory lock not acquired (key: 42891402)"` |

---

## 7. Verification & Testing Plan

### Automated Test Suite

```bash
# Unit tests (parser, validator)
npx vitest run tests/unit/etl/

# Dry-run against production workbook files (zero DB mutations)
npx tsx prisma/etl/reset-verified-catalog.ts --dry-run

# Type-check (zero errors required)
npx tsc --noEmit

# Full test suite
npx vitest run
```

### Manual Verification

- Navigate to `/universities` → verify all 43 university cards with correct English and Arabic titles
- Query search bar on `/` for `"Computer Science"` → verify programs appear
- Open `/universities/auc` and `/universities/asnu` → confirm faculties and degree programs render
- Log into Admin Dashboard (`/admin/catalog`) → confirm management features and completeness scores
- Query `audit_logs` table in Neon console → confirm `CATALOG_RESET` entry exists with correct counts

### Disaster Recovery Test (Pre-Production)

```bash
# Create backup
npx tsx prisma/etl/reset-verified-catalog.ts --backup-only

# Simulate failure and rollback
npx tsx prisma/etl/reset-verified-catalog.ts --rollback <snapshotId>

# Verify row counts match pre-reset manifest
```
