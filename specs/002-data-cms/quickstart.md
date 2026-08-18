# Quickstart Guide: Production Data Architecture & Admin CMS

**Feature Branch**: `002-data-cms`  
**Date**: 2026-08-17  

---

## 1. Prerequisites & Environment

Ensure PostgreSQL is configured in your `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/unigate?schema=public"
```

---

## 2. Ingesting Exhaustive Datasets (ETL Pipeline)

To run the automated ingestion pipeline that reads `Egyptian_Universities_Deep_Exhaustive_Database.json` and loads all 30+ universities, faculties, and degree programs into PostgreSQL:

```bash
# 1. Apply Schema Migrations
pnpm prisma db push

# 2. Execute Exhaustive Ingestion ETL
pnpm tsx prisma/etl/seed-deep.ts

# 3. Generate Slim Search Index
pnpm tsx scripts/generate-search-index.ts
```

---

## 3. Accessing the Admin Management CMS

1. Start development server:
   ```bash
   pnpm dev
   ```
2. Navigate to `http://localhost:3000/admin`.
3. Sign in with an administrative account (or set `role: "ADMIN"` in the database).
4. Explore:
   - `/admin/universities`: Edit profile overview, rankings, and contact channels.
   - `/admin/universities/[id]/faculties`: Manage faculty divisions and deans.
   - `/admin/universities/[id]/programs`: Manage degree programs and tuition rates.
   - `/admin/suggestions`: Review pending community suggestions and approve them with 1 click.
   - `/admin/audit-log`: Inspect history of mutations.

---

## 4. Verification & Testing

```bash
# Run unit and repository tests
pnpm test

# Run TypeScript compilation check
pnpm run type-check
```
