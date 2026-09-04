# Tasks: Production Database Reset & Verified Catalog Ingestion

**Input**: Design documents from `/specs/004-prod-db-verified-reset/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths are specified in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish ETL interfaces, type contracts, and foundational abstractions for the SOLID pipeline.

- [x] T001 [P] Define pipeline step contracts, logger interfaces, and context in `src/server/etl/interfaces/IPipelineStep.ts`
- [x] T002 [P] Define workbook parser and row DTO interfaces in `src/server/etl/interfaces/IWorkbookParser.ts`
- [x] T003 [P] Define snapshot manager and manifest interfaces in `src/server/etl/interfaces/ISnapshotManager.ts`
- [x] T004 [P] Define bilingual enrichment provider interface in `src/server/etl/interfaces/IEnrichmentProvider.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core parser, enrichment dictionary, and Zod validator that all user stories depend upon.

**⚠️ CRITICAL**: No user story ingestion or execution can occur until this phase is verified.

- [x] T005 [P] Create audited bilingual metadata dictionary for all 43 institutions in `src/server/etl/BilingualEnrichmentProvider.ts`
- [x] T006 [P] Implement SheetJS-based workbook parser in `src/server/etl/ExcelWorkbookParser.ts`
- [x] T007 [P] Implement catalog Zod validator and slug generation engine in `src/server/etl/CatalogValidator.ts`
- [x] T008 [P] Implement unit tests for workbook parsing in `tests/unit/etl/parser.test.ts`
- [x] T009 [P] Implement unit tests for catalog validation and enrichment in `tests/unit/etl/validator.test.ts`

**Checkpoint**: Foundation ready — parser, validator, and enrichment pass all unit tests.

---

## Phase 3: User Story 1 - Safe, Automated Production Reset & Verified Data Ingestion (Priority: P1) 🎯 MVP

**Goal**: Implement the core `TransactionalResetPipeline` with PRE-standard SOLID design: advisory lock mutex, split transactions (short lock windows), saga compensation, and JSON structured logging.

**Independent Test**: Execute `npx tsx prisma/etl/reset-verified-catalog.ts --dry-run` and verify that exactly 43 universities, 381 faculties, and 1,448 programs are validated with 0 relational errors and advisory lock capability confirmed.

- [x] T010 [US1] Implement SRE-grade `StructuredLogger` emitting newline-delimited JSON in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T011 [US1] Implement `AdvisoryLockStep` acquiring `pg_try_advisory_lock(42891402)` with unconditional unlock compensation in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T012 [US1] Implement `CatalogResetAndIngestionStep` with split transactions (TX-A purge in FK-safe order, TX-B chunked batch insert) and snapshot rollback compensation in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T013 [US1] Implement `TransactionalResetPipeline` orchestrator with dependency injection and reverse saga compensation in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T014 [US1] Implement enterprise CLI entry point supporting `--dry-run`, `--confirm-production`, and mutex error handling in `prisma/etl/reset-verified-catalog.ts`

**Checkpoint**: User Story 1 MVP complete — transactional reset executes safely with advisory lock protection and split transaction windows.

---

## Phase 4: User Story 2 - Public Search, Exploration & Profile Continuity (Priority: P2)

**Goal**: Invalidate ISR caches and rebuild the public search index to ensure instant, seamless student exploration with zero stale data.

**Independent Test**: Navigate to `/`, `/universities`, and `/majors` post-reset to verify that cards, search filters, and profile routes render with HTTP 200 and zero broken links.

- [x] T015 [US2] Implement ISR cache revalidation (`revalidateTag`, `revalidatePath`) and search cache flusher in `src/server/etl/NextCacheInvalidationService.ts`
- [x] T016 [US2] Implement `CacheInvalidationStep` integrating cache flushing into the pipeline orchestrator in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T017 [US2] Generate and synchronize static public search token catalog in `public/search-index.json`

**Checkpoint**: User Story 2 complete — Next.js ISR caches refreshed and public search indexes accurately reflect all 43 verified institutions.

---

## Phase 5: User Story 3 - Production Pre-Flight Backup & Disaster Recovery (Priority: P3)

**Goal**: Provide automated pre-flight snapshot generation with SHA-256 manifests and sub-60-second disaster recovery rollback.

**Independent Test**: Trigger `--backup-only`, verify JSON dumps and SHA-256 manifest exist in `backups/`, then test `--rollback <snapshotId>` restores database state.

- [x] T018 [US3] Implement catalog table JSON snapshot exporter and SHA-256 manifest generator in `src/server/etl/PostgresSnapshotManager.ts`
- [x] T019 [US3] Implement snapshot restoration and checksum verification engine in `src/server/etl/SnapshotRollbackService.ts`
- [x] T020 [US3] Implement `PreflightSnapshotStep` integrating pre-reset backups into the pipeline in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T021 [US3] Wire `--backup-only`, `--list-backups`, and `--rollback <snapshotId>` commands into `prisma/etl/reset-verified-catalog.ts`

**Checkpoint**: User Story 3 complete — disaster recovery snapshot and automated rollback guarantee sub-60-second recovery SLA.

---

## Phase 6: User Story 4 - Admin Dashboard & RBAC Operational Stability (Priority: P4)

**Goal**: Guarantee administrative RBAC stability, post-ingestion referential integrity, and SOC2/ISO 27001 audit log traceability.

**Independent Test**: Inspect `audit_logs` table for `CATALOG_RESET` entry and verify Super Admin access to catalog management in the Admin Dashboard.

- [x] T022 [P] [US4] Implement post-ingestion referential integrity audit (43 unis, 381 faculties, 1448 programs, 0 orphans) in `src/server/etl/PostIngestionAudit.ts`
- [x] T023 [US4] Implement `PostIngestionAuditStep` integrating automated integrity verification into the pipeline in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T024 [US4] Implement `SystemAuditLogStep` recording `CATALOG_RESET` with pre/post record counts in `src/server/etl/TransactionalResetPipeline.ts`
- [x] T025 [P] [US4] Implement unit tests for post-ingestion integrity audit and orphan detection in `tests/unit/etl/audit.test.ts`

**Checkpoint**: User Story 4 complete — referential integrity guaranteed and SOC2-compliant audit records generated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation, documentation updates, and operational runbook dry run.

- [x] T026 [P] Update npm execution script `"db:reset:verified"` in `package.json`
- [x] T027 Run full test suite across all ETL components via `npx vitest run tests/unit/etl/`
- [x] T028 Perform full dry-run simulation using `npx tsx prisma/etl/reset-verified-catalog.ts --dry-run`
- [x] T029 Execute TypeScript type-check with zero errors via `npx tsc --noEmit`
- [x] T030 Document SRE operational runbook and disaster recovery drill in `specs/004-prod-db-verified-reset/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (T001-T004)
   │
   ▼
Phase 2: Foundational (T005-T009)
   │
   ▼
Phase 3: User Story 1 (P1) 🎯 MVP (T010-T014)
   │
   ├────────────────────────┬────────────────────────┐
   ▼                        ▼                        ▼
Phase 4: US2 (P2)        Phase 5: US3 (P3)        Phase 6: US4 (P4)
(T015-T017)              (T018-T021)              (T022-T025)
   │                        │                        │
   └────────────────────────┴────────────────────────┘
                            │
                            ▼
               Phase 7: Polish (T026-T030)
```

- **Setup (Phase 1)**: Must complete first to provide type contracts.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories.
- **User Story 1 (Phase 3)**: MVP core reset pipeline; must be implemented before dependent feature extensions.
- **User Story 2, 3, 4 (Phases 4, 5, 6)**: Can proceed in parallel or sequentially once US1 foundation is laid.
- **Polish (Phase 7)**: Depends on all user story implementations being completed.

---

## Parallel Execution Opportunities

### Phase 1 (Setup)
```bash
# Can run concurrently (independent interface files):
T001: IPipelineStep.ts
T002: IWorkbookParser.ts
T003: ISnapshotManager.ts
T004: IEnrichmentProvider.ts
```

### Phase 2 (Foundational)
```bash
# Can run concurrently:
T005: BilingualEnrichmentProvider.ts
T006: ExcelWorkbookParser.ts
T007: CatalogValidator.ts
# Tests can run in parallel:
T008: parser.test.ts
T009: validator.test.ts
```

### Across User Stories (Post-US1)
- User Story 2 (Cache Invalidation & Search Index)
- User Story 3 (Snapshot Manager & Rollback CLI)
- User Story 4 (Post-Ingestion Audit & SOC2 AuditLog)

---

## Implementation Strategy

### MVP First (User Story 1 Focus)
1. Complete **Phase 1: Setup** (interfaces and contracts).
2. Complete **Phase 2: Foundational** (parsing, enrichment, Zod validation).
3. Complete **Phase 3: User Story 1** (SOLID pipeline, advisory lock, split transactions).
4. **VALIDATE**: Run `npx tsx prisma/etl/reset-verified-catalog.ts --dry-run` to prove end-to-end data integrity.

### Incremental Delivery
1. Add **User Story 3** to establish disaster recovery snapshots and rollback capabilities.
2. Add **User Story 4** to ensure post-ingestion audit integrity and SOC2 audit logging.
3. Add **User Story 2** to flush ISR caches and synchronize public search tokens.
4. Run **Phase 7 Polish** to verify all Vitest tests, type checking, and quickstart documentation.
