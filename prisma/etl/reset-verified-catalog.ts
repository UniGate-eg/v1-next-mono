#!/usr/bin/env tsx
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { ExcelWorkbookParser } from "../../src/server/etl/ExcelWorkbookParser";
import { BilingualEnrichmentProvider } from "../../src/server/etl/BilingualEnrichmentProvider";
import { CatalogValidator } from "../../src/server/etl/CatalogValidator";
import { TransactionalResetPipeline } from "../../src/server/etl/TransactionalResetPipeline";
import { SnapshotRollbackService } from "../../src/server/etl/SnapshotRollbackService";
import { PostgresSnapshotManager } from "../../src/server/etl/PostgresSnapshotManager";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const isConfirmProd = args.includes("--confirm-production");
  const isBackupOnly = args.includes("--backup-only");
  const isListBackups = args.includes("--list-backups");

  const rollbackIndex = args.indexOf("--rollback");
  const rollbackSnapshotId = rollbackIndex !== -1 ? args[rollbackIndex + 1] : undefined;

  console.log("===================================================================");
  console.log("🏛️  UniGate: Production-Grade Verified Catalog Reset & Ingestion CLI");
  console.log("===================================================================");

  // 1. List Backups
  if (isListBackups) {
    const manager = new PostgresSnapshotManager(prisma);
    const snapshots = await manager.listSnapshots();
    console.log(`\n📂 Available Snapshots in backups/ (${snapshots.length}):`);
    for (const s of snapshots) {
      console.log(`  - ${s.id} | ${s.timestamp} | ${s.recordCounts.universities} unis, ${s.recordCounts.degreePrograms} programs`);
    }
    return;
  }

  // 2. Rollback Operation
  if (rollbackSnapshotId) {
    const rollbackService = new SnapshotRollbackService(prisma);
    const result = await rollbackService.executeRollback(rollbackSnapshotId);
    console.log(`✔ Rollback result: ${result.message}`);
    return;
  }

  // 3. Backup Only
  if (isBackupOnly) {
    const manager = new PostgresSnapshotManager(prisma);
    const manifest = await manager.createSnapshot();
    console.log(`✔ Backup complete: ${manifest.id}`);
    return;
  }

  // Safety check for production environment
  const dbUrl = process.env.DATABASE_URL || "";
  const isNeonOrProd = dbUrl.includes("neon.tech") || process.env.NODE_ENV === "production";

  if (isNeonOrProd && !isDryRun && !isConfirmProd) {
    console.warn("\n⚠️  SAFETY WARNING: You are targeting a cloud/production PostgreSQL database!");
    console.warn("To confirm execution, pass the '--confirm-production' flag:");
    console.warn("  npx tsx prisma/etl/reset-verified-catalog.ts --confirm-production\n");
    process.exit(2);
  }

  // 4. File Paths to Verified Workbooks
  const file1 = path.join(process.cwd(), "src/data/Combined_University_Database_with_ACU_Design_and_Innovative_Arts.xlsx");
  const file2 = path.join(process.cwd(), "src/data/Ahleya_Universities_Cleaned_and_Organized.xlsx");

  console.log("\n📂 Step 1: Loading verified Excel workbooks...");
  console.log(`  [1/2] ${path.basename(file1)}`);
  console.log(`  [2/2] ${path.basename(file2)}`);

  const parser = new ExcelWorkbookParser();
  const wb1 = parser.parseWorkbook(file1);
  const wb2 = parser.parseWorkbook(file2);

  console.log(`  ✔ File 1 parsed: ${wb1.universities.length} unis, ${wb1.academicUnits.length} faculties, ${wb1.academicOfferings.length} programs`);
  console.log(`  ✔ File 2 parsed: ${wb2.universities.length} unis, ${wb2.academicUnits.length} faculties, ${wb2.academicOfferings.length} programs`);

  // 5. Validation & Enrichment
  console.log("\n🔍 Step 2: Validating schemas, referential integrity & enrichment...");
  const enrichmentProvider = new BilingualEnrichmentProvider();
  const validator = new CatalogValidator();

  const report = validator.validate([wb1, wb2], enrichmentProvider);

  if (!report.success) {
    console.error("❌ Validation Failed with errors:");
    for (const err of report.errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(`  ✔ Validation Passed with ZERO errors!`);
  console.log(`  ✔ Total Verified Universities: ${report.stats.universitiesCount}`);
  console.log(`  ✔ Total Academic Units (Faculties): ${report.stats.facultiesCount}`);
  console.log(`  ✔ Total Academic Offerings (Programs): ${report.stats.programsCount}`);

  // 6. Pipeline Execution
  const pipeline = new TransactionalResetPipeline(prisma);
  const result = await pipeline.execute(report, {
    dryRun: isDryRun,
    skipSnapshot: isDryRun
  });

  if (result.dryRun) {
    console.log("\n✅ Dry run verification finished successfully. Ready for execution.");
  } else {
    console.log("\n🎉 Production Catalog Reset & Ingestion completed successfully!");
    console.log(`   Snapshot ID: ${result.snapshotId}`);
    console.log(`   Universities Committed: ${result.universitiesIngested}`);
    console.log(`   Faculties Committed: ${result.facultiesIngested}`);
    console.log(`   Degree Programs Committed: ${result.programsIngested}`);
  }
}

main()
  .catch((e) => {
    console.error("\n❌ Execution failed with unexpected error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
