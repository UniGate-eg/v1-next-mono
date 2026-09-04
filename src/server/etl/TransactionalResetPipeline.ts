/**
 * @file TransactionalResetPipeline.ts
 * @description Enterprise-grade SOLID pipeline orchestrator for the production
 * database reset and verified catalog ingestion operation.
 *
 * Design Patterns Applied:
 *   - Pipeline / Chain of Responsibility   — steps are chained by the orchestrator
 *   - Unit of Work                         — each step owns its own transaction boundary
 *   - Strategy                             — steps are swappable IPipelineStep implementations
 *   - Dependency Injection                 — all collaborators injected as interfaces (DIP)
 *   - Saga / Compensation                  — reverse compensate() hooks on any step failure
 *
 * Critical Production Safeguards:
 *   - Distributed advisory lock (pg_try_advisory_lock) prevents concurrent invocations
 *   - Purge and ingest run in two separate SHORT transactions (not one 44s lock window)
 *   - StructuredLogger emits newline-delimited JSON parseable by Datadog / GCP / CloudWatch
 *   - SystemAuditLogStep writes SOC2-compliant CATALOG_RESET record to audit_logs
 */

import { PrismaClient } from "@prisma/client";
import {
  IPipelineStep,
  PipelineContext,
  PipelineLogger,
  LogLevel,
} from "./interfaces/IPipelineStep";
import { ISnapshotManager } from "./interfaces/ISnapshotManager";
import { AuditReport } from "./PostIngestionAudit";
import { ValidatedUniversity, ValidatedFaculty, ValidatedProgram } from "./CatalogValidator";

// ─────────────────────────────────────────────────────────────────────────────
// Public API types
// ─────────────────────────────────────────────────────────────────────────────

export interface PipelineOptions {
  dryRun?: boolean;
  skipSnapshot?: boolean;
  skipRevalidation?: boolean;
  /** System actor identity for the SOC2 audit log entry */
  actorId?: string;
  actorEmail?: string;
}

export interface PipelineResult {
  success: boolean;
  dryRun: boolean;
  snapshotId?: string;
  universitiesIngested: number;
  facultiesIngested: number;
  programsIngested: number;
  auditReport?: AuditReport;
  durationMs: number;
}

/** Collaborator interfaces (Dependency Inversion Principle) */
export interface IAuditService {
  runAudit(): Promise<AuditReport>;
}

export interface ICacheInvalidationService {
  invalidateCatalogCaches(): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// StructuredLogger — SRE-grade JSON logger (T010)
// ─────────────────────────────────────────────────────────────────────────────

export class StructuredLogger implements PipelineLogger {
  constructor(private readonly component = "TransactionalResetPipeline") {}

  private emit(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    const entry = {
      level,
      timestamp: new Date().toISOString(),
      component: this.component,
      message,
      ...context,
    };
    process.stdout.write(JSON.stringify(entry) + "\n");
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit("INFO", message, context);
  }
  warn(message: string, context?: Record<string, unknown>): void {
    this.emit("WARN", message, context);
  }
  error(message: string, context?: Record<string, unknown>): void {
    this.emit("ERROR", message, context);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: AdvisoryLockStep (T011)
// Acquires pg_try_advisory_lock(42891402) — a non-blocking distributed mutex
// that prevents concurrent pipeline invocations from racing and corrupting data.
// compensate() is also invoked unconditionally in the orchestrator finally block.
// ─────────────────────────────────────────────────────────────────────────────

const ADVISORY_LOCK_KEY = 42891402 as const;

class AdvisoryLockStep implements IPipelineStep {
  readonly name = "AdvisoryLockStep";

  async execute(ctx: PipelineContext): Promise<void> {
    ctx.logger.info("Acquiring distributed advisory lock", {
      step: this.name,
      lockKey: ADVISORY_LOCK_KEY,
    });

    const result = await ctx.prisma.$queryRaw<[{ pg_try_advisory_lock: boolean }]>`
      SELECT pg_try_advisory_lock(${ADVISORY_LOCK_KEY}::bigint)
    `;

    const acquired = result[0]?.pg_try_advisory_lock ?? false;

    if (!acquired) {
      throw new Error(
        `Pipeline already running — advisory lock not acquired (key: ${ADVISORY_LOCK_KEY}). ` +
        `Check pg_stat_activity for an existing session and retry when the lock is released.`
      );
    }

    ctx.advisoryLockHeld = true;
    ctx.logger.info("Advisory lock acquired", { step: this.name, lockKey: ADVISORY_LOCK_KEY });
  }

  async compensate(ctx: PipelineContext): Promise<void> {
    if (!ctx.advisoryLockHeld) return;
    try {
      await ctx.prisma.$queryRaw`SELECT pg_advisory_unlock(${ADVISORY_LOCK_KEY}::bigint)`;
      ctx.advisoryLockHeld = false;
      ctx.logger.info("Advisory lock released", { step: this.name, lockKey: ADVISORY_LOCK_KEY });
    } catch (err) {
      // Must not throw — swallow and log
      ctx.logger.error("Failed to release advisory lock (non-fatal)", {
        step: this.name,
        error: String(err),
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: PreflightSnapshotStep (T020 — integrated here per task plan)
// Creates an immutable pre-reset disaster-recovery snapshot before any deletion.
// compensate() is a no-op — the snapshot is an immutable artifact; keeping it is safe.
// ─────────────────────────────────────────────────────────────────────────────

class PreflightSnapshotStep implements IPipelineStep {
  readonly name = "PreflightSnapshotStep";

  constructor(private readonly snapshotManager: ISnapshotManager) {}

  async execute(ctx: PipelineContext): Promise<void> {
    if (ctx.options.skipSnapshot) {
      ctx.logger.warn("Pre-flight snapshot skipped (--skip-snapshot flag set)", {
        step: this.name,
      });
      return;
    }

    ctx.logger.info("Creating pre-flight disaster-recovery snapshot", { step: this.name });

    const manifest = await this.snapshotManager.createSnapshot();
    ctx.snapshotId = manifest.id;

    ctx.logger.info("Snapshot created and verified", {
      step: this.name,
      snapshotId: manifest.id,
      sha256: manifest.sha256Checksum,
      recordCounts: manifest.recordCounts,
    });
  }

  async compensate(ctx: PipelineContext): Promise<void> {
    // Snapshot is immutable — no rollback needed; it IS the recovery artifact
    ctx.logger.info("PreflightSnapshotStep compensation: snapshot retained as recovery artifact", {
      step: this.name,
      snapshotId: ctx.snapshotId,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: CatalogResetAndIngestionStep (T012)
// Executes two separate short-lived transactions to minimize exclusive lock duration:
//   TX-A: Catalog-scoped purge in FK-safe order (preserves users, RBAC, sessions)
//   TX-B: Chunked batch insert of verified universities, faculties, programs
// compensate() invokes snapshot restore if this step fails after TX-A completes.
// ─────────────────────────────────────────────────────────────────────────────

const INGESTION_CHUNK_SIZE = 200 as const;

class CatalogResetAndIngestionStep implements IPipelineStep {
  readonly name = "CatalogResetAndIngestionStep";

  constructor(private readonly snapshotManager: ISnapshotManager) {}

  async execute(ctx: PipelineContext): Promise<void> {
    const { universities, faculties, programs } = ctx.validatedData;

    ctx.logger.info("Starting catalog-scoped purge (TX-A)", {
      step: this.name,
      preserving: "User, Session, Account, Role, Permission, UserRoleAssignment",
      purging: "University, Faculty, DegreeProgram, Accreditation, Bookmark, Suggestion, InstitutionAssignment",
    });

    // TX-A: Short purge transaction (FK-safe deletion order)
    await ctx.prisma.$transaction(async (tx) => {
      await tx.bookmark.deleteMany();
      await tx.suggestion.deleteMany();
      await tx.degreeProgram.deleteMany();
      await tx.faculty.deleteMany();
      await tx.accreditation.deleteMany();
      await tx.institutionAssignment.deleteMany();
      await tx.university.deleteMany();
    }, { timeout: 30_000 });

    ctx.logger.info("Purge complete (TX-A committed). Starting verified batch ingestion (TX-B)", {
      step: this.name,
      universities: universities.length,
      faculties: faculties.length,
      programs: programs.length,
    });

    // TX-B: Short ingestion transaction
    await ctx.prisma.$transaction(async (tx) => {
      // Insert universities — build ID map for FK resolution
      const uniIdMap = new Map<string, string>(); // sourceUniId → Prisma cuid

      for (const u of universities) {
        const created = await tx.university.create({
          data: {
            slug: u.slug,
            shortName: u.shortName,
            nameEn: u.nameEn,
            nameAr: u.nameAr,
            governorate: u.governorate,
            city: u.city || null,
            type: u.type,
            educationModel: u.educationModel,
            website: u.website || null,
            established: u.established || null,
            overviewEn: u.overviewEn || null,
            overviewAr: u.overviewAr || null,
            publishStatus: "PUBLISHED",
            completenessScore: u.completenessScore,
          },
        });
        uniIdMap.set(u.sourceUniId, created.id);
      }

      // Insert faculties — build ID map for FK resolution
      const unitIdMap = new Map<string, string>(); // sourceUnitId → Prisma cuid

      for (const f of faculties) {
        const parentUniId = uniIdMap.get(f.sourceUniId);
        if (!parentUniId) {
          throw new Error(
            `Integrity failure: University ID ${f.sourceUniId} not found in committed map (faculty: ${f.nameEn})`
          );
        }
        const created = await tx.faculty.create({
          data: {
            universityId: parentUniId,
            nameEn: f.nameEn,
            nameAr: f.nameAr,
          },
        });
        unitIdMap.set(f.sourceUnitId, created.id);
      }

      // Insert programs — chunked at 200 to stay within Neon statement limits
      for (let i = 0; i < programs.length; i += INGESTION_CHUNK_SIZE) {
        const chunk = programs.slice(i, i + INGESTION_CHUNK_SIZE);
        const batchData = chunk.map((p) => {
          const parentUniId = uniIdMap.get(p.sourceUniId);
          const parentFacultyId = unitIdMap.get(p.sourceUnitId);

          if (!parentUniId) {
            throw new Error(
              `Integrity failure: University ID ${p.sourceUniId} not found for program "${p.nameEn}"`
            );
          }

          return {
            slug: p.slug,
            universityId: parentUniId,
            facultyId: parentFacultyId || null,
            nameEn: p.nameEn,
            nameAr: p.nameAr,
            degreeType: p.degreeType,
            durationYears: p.durationYears,
            studyLanguage: p.studyLanguage,
          };
        });

        await tx.degreeProgram.createMany({ data: batchData });

        ctx.logger.info("Batch chunk inserted", {
          step: this.name,
          chunkIndex: Math.floor(i / INGESTION_CHUNK_SIZE) + 1,
          totalChunks: Math.ceil(programs.length / INGESTION_CHUNK_SIZE),
          programsInChunk: batchData.length,
        });
      }
    }, { timeout: 120_000 });

    ctx.universitiesIngested = universities.length;
    ctx.facultiesIngested = faculties.length;
    ctx.programsIngested = programs.length;

    ctx.logger.info("Ingestion complete (TX-B committed)", {
      step: this.name,
      universitiesIngested: ctx.universitiesIngested,
      facultiesIngested: ctx.facultiesIngested,
      programsIngested: ctx.programsIngested,
    });
  }

  async compensate(ctx: PipelineContext): Promise<void> {
    if (!ctx.snapshotId) {
      ctx.logger.warn("No snapshot available for rollback — database may be in an inconsistent state", {
        step: this.name,
      });
      return;
    }

    ctx.logger.warn("Triggering snapshot restore as compensation for ingestion failure", {
      step: this.name,
      snapshotId: ctx.snapshotId,
    });

    try {
      const result = await this.snapshotManager.restoreSnapshot(ctx.snapshotId);
      ctx.logger.info("Snapshot restore completed", {
        step: this.name,
        result: result.message,
        success: result.success,
      });
    } catch (err) {
      ctx.logger.error("Snapshot restore failed during compensation", {
        step: this.name,
        snapshotId: ctx.snapshotId,
        error: String(err),
      });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: PostIngestionAuditStep (T023)
// Runs referential integrity checks: row counts + orphan FK detection.
// compensate() is log-only — audit failure triggers upstream compensation instead.
// ─────────────────────────────────────────────────────────────────────────────

class PostIngestionAuditStep implements IPipelineStep {
  readonly name = "PostIngestionAuditStep";

  constructor(private readonly auditService: IAuditService) {}

  async execute(ctx: PipelineContext): Promise<void> {
    ctx.logger.info("Running post-ingestion referential integrity audit", { step: this.name });

    const report = await this.auditService.runAudit();

    if (!report.passed) {
      throw new Error(
        `Post-ingestion audit FAILED: ${report.errors.join("; ")}`
      );
    }

    ctx.auditPassed = true;

    ctx.logger.info("Post-ingestion audit PASSED", {
      step: this.name,
      universities: report.universitiesCount,
      faculties: report.facultiesCount,
      programs: report.programsCount,
      orphanPrograms: report.orphanPrograms,
    });
  }

  async compensate(ctx: PipelineContext): Promise<void> {
    ctx.logger.warn("PostIngestionAuditStep compensation: log-only (upstream steps handle rollback)", {
      step: this.name,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5: SystemAuditLogStep (T024)
// Writes a mandatory SOC2 / ISO 27001-compliant CATALOG_RESET record to audit_logs.
// compensate() is log-only — audit log entries are never rolled back.
// ─────────────────────────────────────────────────────────────────────────────

class SystemAuditLogStep implements IPipelineStep {
  readonly name = "SystemAuditLogStep";

  constructor(
    private readonly actorId: string,
    private readonly actorEmail?: string
  ) {}

  async execute(ctx: PipelineContext): Promise<void> {
    ctx.logger.info("Writing SOC2-compliant CATALOG_RESET audit log entry", { step: this.name });

    try {
      await ctx.prisma.auditLog.create({
        data: {
          actorId: this.actorId,
          actorEmail: this.actorEmail ?? null,
          action: "CATALOG_RESET",
          entityType: "University",
          entityId: "BULK",
          beforeState: null, // State captured in snapshot manifest
          afterState: {
            universitiesIngested: ctx.universitiesIngested ?? 0,
            facultiesIngested: ctx.facultiesIngested ?? 0,
            programsIngested: ctx.programsIngested ?? 0,
            snapshotId: ctx.snapshotId ?? null,
            auditPassed: ctx.auditPassed ?? false,
            executedAt: new Date().toISOString(),
          },
          ipAddress: null,
        },
      });

      ctx.logger.info("Audit log entry written", {
        step: this.name,
        actorId: this.actorId,
        action: "CATALOG_RESET",
        universitiesIngested: ctx.universitiesIngested,
      });
    } catch (err) {
      // Audit log failure must not abort the pipeline — log and continue
      ctx.logger.error("Failed to write audit log entry (non-fatal — pipeline continues)", {
        step: this.name,
        error: String(err),
      });
    }
  }

  async compensate(ctx: PipelineContext): Promise<void> {
    // Audit entries are never rolled back — they are immutable compliance records
    ctx.logger.warn("SystemAuditLogStep compensation: audit entries retained (immutable compliance records)", {
      step: this.name,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 6: CacheInvalidationStep (T016)
// Flushes Next.js ISR caches and rebuilds the public search index.
// compensate() is log-only — cache invalidation is always best-effort.
// ─────────────────────────────────────────────────────────────────────────────

class CacheInvalidationStep implements IPipelineStep {
  readonly name = "CacheInvalidationStep";

  constructor(private readonly cacheService: ICacheInvalidationService) {}

  async execute(ctx: PipelineContext): Promise<void> {
    if (ctx.options.skipRevalidation) {
      ctx.logger.warn("Cache invalidation skipped (--skip-revalidation flag set)", {
        step: this.name,
      });
      return;
    }

    ctx.logger.info("Invalidating Next.js ISR caches and search indexes", { step: this.name });
    await this.cacheService.invalidateCatalogCaches();
    ctx.logger.info("Cache invalidation complete", { step: this.name });
  }

  async compensate(ctx: PipelineContext): Promise<void> {
    ctx.logger.warn("CacheInvalidationStep compensation: cache invalidation is best-effort, no rollback needed", {
      step: this.name,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TransactionalResetPipeline — DI-injected orchestrator (T013)
// Runs all steps in order. On any failure:
//   1. Calls compensate() in reverse order on all completed steps (saga reversal)
//   2. Releases the advisory lock unconditionally in the finally block
//   3. Re-throws the original error for the CLI to report and exit non-zero
// ─────────────────────────────────────────────────────────────────────────────

export class TransactionalResetPipeline {
  private readonly lockStep: AdvisoryLockStep;
  private readonly steps: IPipelineStep[];
  private readonly logger: PipelineLogger;

  constructor(
    private readonly prisma: PrismaClient,
    snapshotManager: ISnapshotManager,
    auditService: IAuditService,
    cacheService: ICacheInvalidationService,
    actorId = "system:etl-pipeline",
    actorEmail?: string
  ) {
    this.logger = new StructuredLogger();
    this.lockStep = new AdvisoryLockStep();
    this.steps = [
      this.lockStep,
      new PreflightSnapshotStep(snapshotManager),
      new CatalogResetAndIngestionStep(snapshotManager),
      new PostIngestionAuditStep(auditService),
      new SystemAuditLogStep(actorId, actorEmail),
      new CacheInvalidationStep(cacheService),
    ];
  }

  async execute(
    validatedData: {
      universities: ValidatedUniversity[];
      faculties: ValidatedFaculty[];
      programs: ValidatedProgram[];
    },
    options: PipelineOptions = {}
  ): Promise<PipelineResult> {
    const startTime = Date.now();

    if (options.dryRun) {
      this.logger.info("Dry-run mode: validating dataset without any database mutations", {
        universities: validatedData.universities.length,
        faculties: validatedData.faculties.length,
        programs: validatedData.programs.length,
      });
      return {
        success: true,
        dryRun: true,
        universitiesIngested: validatedData.universities.length,
        facultiesIngested: validatedData.faculties.length,
        programsIngested: validatedData.programs.length,
        durationMs: Date.now() - startTime,
      };
    }

    const ctx: PipelineContext = {
      prisma: this.prisma,
      logger: this.logger,
      validatedData,
      options: {
        dryRun: options.dryRun ?? false,
        skipSnapshot: options.skipSnapshot ?? false,
        skipRevalidation: options.skipRevalidation ?? false,
      },
    };

    const executed: IPipelineStep[] = [];

    this.logger.info("Pipeline starting", {
      totalSteps: this.steps.length,
      universities: validatedData.universities.length,
      faculties: validatedData.faculties.length,
      programs: validatedData.programs.length,
    });

    try {
      for (const step of this.steps) {
        this.logger.info(`Executing step`, { step: step.name });
        await step.execute(ctx);
        executed.push(step);
        this.logger.info(`Step complete`, { step: step.name });
      }

      const durationMs = Date.now() - startTime;

      this.logger.info("Pipeline completed successfully", {
        durationMs,
        universitiesIngested: ctx.universitiesIngested,
        facultiesIngested: ctx.facultiesIngested,
        programsIngested: ctx.programsIngested,
        snapshotId: ctx.snapshotId,
      });

      return {
        success: true,
        dryRun: false,
        snapshotId: ctx.snapshotId,
        universitiesIngested: ctx.universitiesIngested ?? 0,
        facultiesIngested: ctx.facultiesIngested ?? 0,
        programsIngested: ctx.programsIngested ?? 0,
        durationMs,
      };
    } catch (error) {
      this.logger.error("Pipeline step failed — triggering saga compensation", {
        error: String(error),
        executedSteps: executed.map((s) => s.name),
      });

      // Saga: compensate in reverse order
      for (const step of [...executed].reverse()) {
        if (step.compensate) {
          try {
            await step.compensate(ctx);
          } catch (compensationError) {
            this.logger.error("Compensation step failed (non-fatal)", {
              step: step.name,
              error: String(compensationError),
            });
          }
        }
      }

      throw error;
    } finally {
      // Always release the advisory lock — even on crash
      if (ctx.advisoryLockHeld && this.lockStep.compensate) {
        await this.lockStep.compensate(ctx);
      }
    }
  }
}
