#!/usr/bin/env tsx
/**
 * @file reset-verified-catalog.ts
 * @description Enterprise CLI entry point for the TransactionalResetPipeline.
 *
 * Usage:
 *   npx tsx prisma/etl/reset-verified-catalog.ts --dry-run
 *   npx tsx prisma/etl/reset-verified-catalog.ts --confirm-production
 *   npx tsx prisma/etl/reset-verified-catalog.ts --backup-only
 *   npx tsx prisma/etl/reset-verified-catalog.ts --list-backups
 *   npx tsx prisma/etl/reset-verified-catalog.ts --rollback <snapshotId>
 *
 * --confirm-production refuses to run while the type classification audit
 * (specs/005-university-type-consistency/audit/type-audit.md) is unverified —
 * see BilingualEnrichmentProvider.AUDIT_HUMAN_VERIFIED. Add
 * --acknowledge-unverified-audit only if you intend to proceed anyway.
 */

import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { ExcelWorkbookParser } from "../../src/server/etl/ExcelWorkbookParser";
import { BilingualEnrichmentProvider } from "../../src/server/etl/BilingualEnrichmentProvider";
import { CatalogValidator } from "../../src/server/etl/CatalogValidator";
import { TransactionalResetPipeline, StructuredLogger } from "../../src/server/etl/TransactionalResetPipeline";
import { SnapshotRollbackService } from "../../src/server/etl/SnapshotRollbackService";
import { PostgresSnapshotManager } from "../../src/server/etl/PostgresSnapshotManager";
import { PostIngestionAudit } from "../../src/server/etl/PostIngestionAudit";
import { NextCacheInvalidationService } from "../../src/server/etl/NextCacheInvalidationService";

const prisma = new PrismaClient();
const logger = new StructuredLogger("reset-verified-catalog");

async function main() {
  const args = process.argv.slice(2);
  const isDryRun        = args.includes("--dry-run");
  const isConfirmProd   = args.includes("--confirm-production");
  const isBackupOnly    = args.includes("--backup-only");
  const isListBackups   = args.includes("--list-backups");
  const acknowledgeUnverifiedAudit = args.includes("--acknowledge-unverified-audit");

  const rollbackIndex     = args.indexOf("--rollback");
  const rollbackSnapshotId = rollbackIndex !== -1 ? args[rollbackIndex + 1] : undefined;

  logger.info("UniGate: Production-Grade Verified Catalog Reset & Ingestion CLI", {
    command: args.join(" ") || "(no flags — use --dry-run or --confirm-production)",
  });

  // ── 1. List Backups ──────────────────────────────────────────────────────
  if (isListBackups) {
    const manager = new PostgresSnapshotManager(prisma);
    const snapshots = await manager.listSnapshots();
    logger.info(`Available snapshots (${snapshots.length})`, {
      snapshots: snapshots.map((s) => ({
        id: s.id,
        timestamp: s.timestamp,
        universities: s.recordCounts.universities,
        programs: s.recordCounts.degreePrograms,
      })),
    });
    return;
  }

  // ── 2. Rollback Operation ────────────────────────────────────────────────
  if (rollbackSnapshotId) {
    logger.info("Initiating rollback to snapshot", { snapshotId: rollbackSnapshotId });
    const rollbackService = new SnapshotRollbackService(prisma);
    const result = await rollbackService.executeRollback(rollbackSnapshotId);
    if (result.success) {
      logger.info("Rollback completed successfully", { message: result.message });
    } else {
      logger.error("Rollback failed", { message: result.message });
      process.exit(1);
    }
    return;
  }

  // ── 3. Backup Only ───────────────────────────────────────────────────────
  if (isBackupOnly) {
    logger.info("Creating pre-flight disaster-recovery snapshot (--backup-only mode)");
    const manager = new PostgresSnapshotManager(prisma);
    const manifest = await manager.createSnapshot();
    logger.info("Backup complete", {
      snapshotId: manifest.id,
      sha256: manifest.sha256Checksum,
      recordCounts: manifest.recordCounts,
    });
    return;
  }

  // ── 4. Production Safety Guard ───────────────────────────────────────────
  const dbUrl = process.env.DATABASE_URL || "";
  const isNeonOrProd = dbUrl.includes("neon.tech") || process.env.NODE_ENV === "production";

  if (isNeonOrProd && !isDryRun && !isConfirmProd) {
    logger.warn("SAFETY GUARD: Targeting production database. Re-run with --confirm-production to proceed.", {
      hint: "npx tsx prisma/etl/reset-verified-catalog.ts --confirm-production",
    });
    process.exit(2);
  }

  // ── 5. Parse Verified Excel Workbooks ───────────────────────────────────
  const file1 = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  const file2 = path.join(process.cwd(), "src/data/Ahleya_Universities_Cleaned_and_Organized.xlsx");

  logger.info("Loading verified Excel workbooks", {
    file1: path.basename(file1),
    file2: path.basename(file2),
  });

  const parser = new ExcelWorkbookParser();
  const wb1 = parser.parseWorkbook(file1);
  const wb2 = parser.parseWorkbook(file2);

  logger.info("Workbooks parsed", {
    file1: { universities: wb1.universities.length, faculties: wb1.academicUnits.length, programs: wb1.academicOfferings.length },
    file2: { universities: wb2.universities.length, faculties: wb2.academicUnits.length, programs: wb2.academicOfferings.length },
  });

  // ── 6. Validate & Enrich ─────────────────────────────────────────────────
  logger.info("Validating schemas, referential integrity, and bilingual enrichment");

  const enrichmentProvider = new BilingualEnrichmentProvider();
  const validator = new CatalogValidator();
  const report = validator.validate([wb1, wb2], enrichmentProvider);

  // Type classification summary logging (contracts/import-review-report.contract.md)
  const validatorLogger = new StructuredLogger("CatalogValidator");
  const blockingReviewCount = report.typeReview.filter((r) => r.blocking).length;
  validatorLogger.info("Type classification summary", {
    typeCounts: report.typeCounts,
    reviewCount: report.typeReview.length,
    blockingReviewCount,
  });

  for (const review of report.typeReview) {
    validatorLogger.warn("Type review required", {
      institutionId: review.institutionId,
      nameEn: review.nameEn,
      originalValue: review.originalValue,
      reason: review.reason,
      candidates: review.candidates,
      blocking: review.blocking,
    });
  }

  if (!report.success) {
    logger.error("Validation failed — pipeline aborted", { errors: report.errors });
    process.exit(1);
  }

  // ── 6b. Audit Sign-Off Guard ──────────────────────────────────────────────
  // The type classification audit (specs/005-university-type-consistency/audit/type-audit.md)
  // records decree references drafted during research. They must be checked by a human
  // against the official MoHE/SCU registry before they are used to reset production data.
  if (isConfirmProd && !report.auditHumanVerified && !acknowledgeUnverifiedAudit) {
    logger.error(
      "SAFETY GUARD: Type classification audit has not been human-verified against the official MoHE/SCU registry. " +
        "Refusing --confirm-production. Verify specs/005-university-type-consistency/audit/type-audit.md, " +
        "flip BilingualEnrichmentProvider.AUDIT_HUMAN_VERIFIED to true once confirmed, or re-run with " +
        "--acknowledge-unverified-audit to proceed anyway at your own risk.",
      { warnings: report.warnings }
    );
    process.exit(3);
  }
  if (isConfirmProd && !report.auditHumanVerified && acknowledgeUnverifiedAudit) {
    logger.warn("Proceeding with an UNVERIFIED type classification audit — --acknowledge-unverified-audit was passed.", {
      warnings: report.warnings,
    });
  }

  logger.info("Validation passed with zero errors", {
    universitiesCount: report.stats.universitiesCount,
    facultiesCount: report.stats.facultiesCount,
    programsCount: report.stats.programsCount,
  });

  // ── 7. Build SOLID Pipeline with DI ─────────────────────────────────────
  const snapshotManager  = new PostgresSnapshotManager(prisma);
  const auditService     = new PostIngestionAudit(prisma);
  const cacheService     = new NextCacheInvalidationService();

  // Actor identity — fall back to system actor for non-interactive CLI runs
  const actorId    = process.env.ETL_ACTOR_ID    ?? "system:etl-pipeline";
  const actorEmail = process.env.ETL_ACTOR_EMAIL ?? undefined;

  const pipeline = new TransactionalResetPipeline(
    prisma,
    snapshotManager,
    auditService,
    cacheService,
    actorId,
    actorEmail
  );

  // ── 8. Execute ───────────────────────────────────────────────────────────
  const result = await pipeline.execute(report.validatedData, {
    dryRun:           isDryRun,
    skipSnapshot:     isDryRun,
    skipRevalidation: isDryRun,
    actorId,
    actorEmail,
  });

  if (result.dryRun) {
    logger.info("Dry-run verification completed — zero database modifications made", {
      universitiesVerified: result.universitiesIngested,
      facultiesVerified:    result.facultiesIngested,
      programsVerified:     result.programsIngested,
      durationMs:           result.durationMs,
    });
  } else {
    logger.info("Production catalog reset and ingestion completed successfully", {
      snapshotId:            result.snapshotId,
      universitiesIngested:  result.universitiesIngested,
      facultiesIngested:     result.facultiesIngested,
      programsIngested:      result.programsIngested,
      durationMs:            result.durationMs,
    });
  }
}

main()
  .catch((e) => {
    logger.error("Unhandled pipeline error — process exiting non-zero", { error: String(e) });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
