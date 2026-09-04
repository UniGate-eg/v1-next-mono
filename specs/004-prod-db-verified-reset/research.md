# Research & Technical Decisions: Production DB Reset & Verified Ingestion

**Feature**: [spec.md](spec.md)  
**Date**: 2026-09-04  
**Status**: Completed  

---

## 1. Catalog-Scoped Reset vs. Clean-Slate Wipe

- **Decision**: Implement a **Catalog-Scoped Reset** that strictly preserves authentication and system RBAC entities (`User`, `Session`, `Account`, `Verification`, `Role`, `Permission`, `RolePermission`, `UserRoleAssignment`), while truncating/purging educational catalog entities (`University`, `Faculty`, `DegreeProgram`, `Accreditation`), `InstitutionAssignment`, and cascading orphaned bookmarks/suggestions.
- **Rationale**: Production environments have existing staff, admin, and student accounts. Wiping users forces everyone to re-register, invalidates sessions, and breaks existing auth credentials. A catalog-scoped purge cleans out all legacy/unverified university data while maintaining 100% security continuity.
- **Alternatives Considered**:
  - *Full `prisma migrate reset`*: Rejected because it drops the entire database schema, wips all accounts, and requires complete re-provisioning of users.
  - *Selective in-place updates*: Rejected because legacy data contains unverified slugs, invalid faculties, and mock scrapings; an atomic wipe-and-replace of catalog tables guarantees zero residual unverified records.

---

## 2. Ingestion Architecture & SOLID Principles

- **Decision**: Structure the ingestion pipeline as an interface-driven, decoupled service architecture:
  - `IWorkbookParser` / `ExcelWorkbookParser`: Reads and extracts raw sheets from the two Excel files.
  - `IUniversityEnrichmentProvider` / `BilingualEnrichmentProvider`: Provides canonical Arabic names, Egyptian governorates, websites, logos, and education models.
  - `ICatalogValidator` / `ZodCatalogValidator`: Enforces strict data types and relational foreign key integrity across sheets prior to any DB write.
  - `ISnapshotManager` / `PostgresSnapshotManager`: Takes immutable pre-reset backups and manages disaster recovery rollbacks.
  - `IVerifiedCatalogSeeder` / `PrismaVerifiedCatalogSeeder`: Handles transactional database insertion.
  - `ICacheInvalidationService` / `NextCacheInvalidationService`: Purges Next.js ISR caches and in-memory search caches.
- **Rationale**: Follows Single Responsibility (SRP), Open/Closed (OCP), and Dependency Inversion (DIP). Testing can be performed on individual components with mock data without requiring a live database connection.
- **Alternatives Considered**:
  - *Single monolithic script*: (similar to old `seed-excel.ts`) Rejected because monolithic scripts mix parsing, data enrichment, DB writes, and error handling, making them brittle and difficult to unit test.

---

## 3. Deterministic Slug Generation

- **Decision**: Generate 100% deterministic, human-readable slugs:
  - University slug: `slugify(shortName)` or `slugify(nameEn)` (e.g. `auc`, `guc`, `asnu`, `nasu`).
  - Faculty slug: scoped to university ID or slug (e.g. `auc-school-of-sciences-and-engineering`).
  - DegreeProgram slug: `slugify(`${uniShort}-${offeringId || officialName}`)` (e.g. `auc-cs`, `guc-computer-science-and-engineering`, `asnu-medicine`).
- **Rationale**: The previous `seed-excel.ts` used `Math.random().toString(36)` in slugs, making slugs non-deterministic and breaking bookmark URLs, SEO links, and re-running idempotency. Deterministic slugs guarantee idempotency.
- **Alternatives Considered**:
  - *UUID/CUID in slug*: Bad for SEO and readability.
  - *Pure program name*: Causes collisions when two universities offer "Computer Science". Prefixing university short name guarantees uniqueness.

---

## 4. Bilingual Enrichment Strategy

- **Decision**: Maintain an audited, version-controlled TypeScript dictionary (`verifiedUniversityMetadata.ts`) mapping all 43 universities to their canonical Arabic name (`nameAr`), Egyptian governorate, city, education model (`AMERICAN`, `GERMAN`, `BRITISH`, `EGYPTIAN`, `FRENCH`), university type (`PRIVATE`, `NATIONAL`), and official website.
- **Rationale**: Both Excel workbooks are primarily in English, but UniGate's database schema and frontend require Arabic names and governorates for search filters and localization. Using an audited dictionary ensures 100% accuracy and zero AI hallucinations.
- **Data Reconciliation**:
  - 39 of 43 universities match canonical entries in `src/data/database.js`.
  - The remaining 4 National universities (NINU - New Ismailia, KNU - Kafr Elsheikh, DNU - Damietta, UFE - Université Française d’Égypte) are enriched with their official government-verified Arabic names and campus locations.

---

## 5. Pre-Flight Snapshot & Rollback Strategy

- **Decision**: Before executing any delete query, the pipeline automatically:
  1. Exports all existing records in `universities`, `faculties`, `degree_programs`, and `accreditations` to a timestamped JSON snapshot under `backups/pre-reset-[timestamp]/`.
  2. Calculates and records a SHA-256 checksum manifest and record count.
  3. Provides a dedicated `--rollback <snapshotId>` command that restores the exact pre-reset state within 60 seconds if needed.
- **Rationale**: Fulfills enterprise production-grade disaster recovery standards.

---

## 6. Frontend Continuity & Cache Invalidation

- **Decision**: Post-commit, the pipeline automatically calls:
  1. Next.js revalidation: `revalidateTag('universities')`, `revalidatePath('/')`, `revalidatePath('/universities')`, `revalidatePath('/majors')`.
  2. Clears in-memory query cache instances (`CachedUniversityRepository`).
  3. Rebuilds `findForSearch()` token caches.
- **Rationale**: Prevents users from receiving stale cached versions of the old database.
