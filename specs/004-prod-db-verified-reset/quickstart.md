# Quickstart: Production Database Reset & Verified Ingestion

## 1. Dry Run Verification (No Database Writes)
Validate the integrity of both Excel workbooks, ensure zero missing foreign keys, and inspect row counts:
```bash
npx tsx prisma/etl/reset-verified-catalog.ts --dry-run
```

Expected Output:
```text
✔ Workbook 1 Loaded: 24 Universities, 209 Faculties, 1021 Programs
✔ Workbook 2 Loaded: 19 Universities, 172 Faculties, 427 Programs
✔ Deduplication complete: 43 unique universities resolved
✔ Referential integrity verified: 100% of programs link to valid faculties
✔ Dry run complete: 0 errors detected
```

## 2. Execute Staging / Development Reset
Run against local or staging PostgreSQL database:
```bash
npx tsx prisma/etl/reset-verified-catalog.ts
```

## 3. Execute Production Reset
For production runs, pass the explicit safety confirmation flag:
```bash
npx tsx prisma/etl/reset-verified-catalog.ts --confirm-production
```

## 4. Emergency Disaster Recovery (Rollback)
If needed, restore the exact database state saved right before the reset:
```bash
npx tsx prisma/etl/reset-verified-catalog.ts --rollback <snapshotId>
```

## 5. Verify Frontend & Catalog
1. Visit `http://localhost:3000/universities` to verify the 43 institutions.
2. Visit `http://localhost:3000/majors` to search across the 1,448 degree programs.
3. Log into Admin Dashboard (`/admin/catalog`) to check completeness scores.
