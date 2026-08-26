# Phase 0 Research: Admin Dashboard & Extensible RBAC

**Feature**: `003-admin-dashboard-rbac`
**Date**: 2026-08-26
**Author**: Platform Engineering (Principal Engineer Level)

---

## Executive Summary

The transition from a static enum-based `UserRole` to a dynamic, database-driven RBAC system is the most significant architectural shift in this feature. This document resolves all technical unknowns using the existing Next.js 15 / Prisma / PostgreSQL / BetterAuth / Tailwind CSS v4 / shadcn/ui stack, following FAANG-grade principal engineering standards.

Key architectural decisions:
- **Hybrid RBAC** via additive Prisma tables (zero breaking changes, backward compatible with BetterAuth)
- **Zero-Trust Server Actions** via `withAdminAuth` HOC with live PostgreSQL validation on every call
- **React `cache()` memoization** for permission checks to eliminate N+1 within a single server request
- **Strategy Pattern** for atomic rollback engine (per-entity-type handlers)
- **Denormalized `completenessScore` integer** updated post-save for performant catalog lists
- **Chunked Prisma transactions** for bulk operations with per-record audit

---

## Architecture Overview

```
Client (React)          Next.js Server                  PostgreSQL
   |                        |                               |
   |--- Server Action ------>|                               |
   |                   [withAdminAuth HOC]                  |
   |                        |-- getSession() -> BetterAuth  |
   |                        |-- findById(userId) ----------->|
   |                        |<-- liveUser (status check) ----|
   |                        |-- hasPermission() ------------>|
   |                        |<-- permitted bool --------------|
   |                        |-- handler(ctx, input)          |
   |                        |      [Service Layer]           |
   |                        |-- Repository calls ----------->|
   |                        |<-- data ------------------------|
   |                        |-- AuditLog.create() ---------->|
   |                        |-- revalidateTag()              |
   |<-- ActionResult<T> -----|                               |
```

---

## Technology Compatibility Matrix

| Technology | Version | Compatibility Notes |
|:---|:---|:---|
| Next.js | 15 App Router | Server Actions + `cache()` ideal for auth gates and permission memoization |
| TypeScript | 5.8 (Strict) | Deep generics for `ActionResult<T>`, HOC types, discriminated unions |
| Prisma | 6.4 | Full JSON diffing, nested transactions, `createMany`, composite index support |
| BetterAuth | Latest | Session cookie preserved; DB gate sits adjacent to session parsing |
| PostgreSQL | 16+ | JSONB operators, composite indexes, `SERIALIZABLE` isolation for rollbacks |
| Tailwind CSS | v4 | Utility classes for shadcn/ui component styling |
| Zustand | 5 | Client-side bulk selection state without URL pollution |
| Zod | 3.24+ | Schema validation applied before `withAdminAuth` to reject malformed input early |
| shadcn/ui | Latest | Radix UI primitives for accessible DataTable, Sheet, Dialog, Popover |

---

## Decision 1: Hybrid RBAC Strategy

- **Decision**: Additive parallel tables (`Role`, `Permission`, `RolePermission`, `UserRoleAssignment`, `InstitutionAssignment`) alongside the preserved `UserRole` enum on the `User` model. A dual-write compatibility layer syncs the legacy `role` field during the transition window.
- **Rationale**: Big-bang migrations of authorization logic carry unacceptable deployment risk. The additive approach allows BetterAuth session cookies (which embed `user.role`) to continue functioning for basic gating while the new system handles fine-grained permissions.
- **Implementation Notes**:
  - BetterAuth sessions continue providing base `user.id` and legacy `user.role`.
  - New `RbacService.hasPermission()` queries `UserRoleAssignment` + `RolePermission` from live DB.
  - Bootstrap `seed.ts` also updates `user.role` (legacy) for BetterAuth compatibility.
  - A future cleanup sprint (after full validation) removes the legacy enum reference from admin guards.
- **Alternatives Considered**:
  - Complete schema replacement: Rejected — deployment risk, active session disruption.
  - BetterAuth custom RBAC plugin: Rejected — couples RBAC to auth provider, loses flexibility.
- **Risk**: Technical debt window with both systems active. Mitigated by clear deprecation timeline (2 sprints post-launch).

---

## Decision 2: Permission Check Architecture

- **Decision**: `RbacService.hasPermission(userId, permissionCode, universityId?)` queries live PostgreSQL, wrapped in React's `cache()` for request-level memoization to prevent N+1 on dashboard renders.
- **Rationale**: Admin actions demand live DB checks — a permission revoked milliseconds ago must be enforced on the very next action. React `cache()` (request memoization, NOT cross-request) ensures multiple components checking the same user's permissions in one RSC render tree only hit the DB once.
- **Implementation Notes**:
  ```typescript
  import { cache } from 'react';
  
  export const getUserPermissions = cache(async (userId: string): Promise<UserContext> => {
    const assignments = await prisma.userRoleAssignment.findMany({
      where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
        institutionAssignments: true,
      },
    });
    // Build permission set + institution scope
    const permissions = new Set(assignments.flatMap(a =>
      a.role.permissions.map(rp => rp.permission.code)
    ));
    const universityIds = assignments.flatMap(a =>
      a.institutionAssignments.map(ia => ia.universityId)
    );
    return { userId, permissions, assignedUniversityIds: universityIds.length > 0 ? universityIds : 'GLOBAL' };
  });
  ```
- **Required Indexes**:
  - `@@index([userId])` on `UserRoleAssignment`
  - `@@id([roleId, permissionId])` on `RolePermission`
  - `@@index([userId, isRead])` on `AdminNotification`
- **Alternatives Considered**:
  - Redis cache: Overkill at current scale, adds operational complexity.
  - Storing permissions in JWT/session: Rejected — delays permission revocation until token expiry.
- **Risk**: Cold query latency. Mitigated by composite indexes and connection pooling (PgBouncer/Neon).

---

## Decision 3: Session Defense Pattern -- `withAdminAuth` HOC

- **Decision**: A typed Higher-Order Function `withAdminAuth<TInput, TOutput>(permissionCode, handler)` wraps every administrative Server Action, enforcing live DB checks and returning typed `ActionResult<T>` discriminated unions.
- **Rationale**: Centralizes auth logic, prevents accidental omission, ensures consistent error shapes (`{ success: false, error, code }` vs `{ success: true, data }`).
- **Implementation Notes**:
  ```typescript
  type ActionResult<T> = { success: true; data: T } | { success: false; error: string; code: 403 | 400 | 500 };
  
  export function withAdminAuth<TInput, TOutput>(
    permissionCode: PermissionCode,
    handler: (ctx: UserContext, input: TInput) => Promise<TOutput>
  ) {
    return async (input: TInput): Promise<ActionResult<TOutput>> => {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user) return { success: false, error: 'Unauthenticated', code: 403 };
      
      const liveUser = await userRepository.findById(session.user.id);
      if (!liveUser || liveUser.status === 'SUSPENDED') {
        // Immediately revoke stale session cookie
        await auth.api.revokeSession({ token: session.session.token });
        return { success: false, error: 'Account suspended or not found', code: 403 };
      }
      
      const ctx = await getUserPermissions(liveUser.id); // React cache() memoized
      if (!ctx.permissions.has(permissionCode)) {
        return { success: false, error: 'Insufficient permissions', code: 403 };
      }
      
      try {
        const data = await handler(ctx, input);
        return { success: true, data };
      } catch (err) {
        console.error('[AdminAction Error]', err);
        return { success: false, error: (err as Error).message, code: 500 };
      }
    };
  }
  ```
- **Alternatives Considered**: Manual per-action checks — Rejected (error-prone, violates DRY).
- **Risk**: HOC swallows stack traces. Mitigated by structured logging before returning error result.

---

## Decision 4: Atomic Rollback Engine

- **Decision**: Service-layer rollback using `IRollbackStrategy` per entity type, executed inside a Prisma `$transaction` with `SERIALIZABLE` isolation. `RollbackStrategyFactory` selects the correct strategy by `entityType`.
- **Rationale**: Different entities have different FK dependency orders and validation requirements. The Strategy Pattern encapsulates this per-entity complexity cleanly.
- **Implementation Notes**:
  ```typescript
  // Algorithm for UniversityRollbackStrategy:
  // 1. Begin $transaction({ isolationLevel: 'Serializable' })
  // 2. Read current state from DB (verify entity still exists)
  // 3. Parse beforeState JSON from AuditLog
  // 4. Validate all FK dependencies exist (facultyId, universityId, etc.)
  // 5. Apply beforeState fields via prisma[entityType].update()
  // 6. Create new AuditLog entry: action='ROLLBACK', referencing original auditLogId
  // 7. Commit transaction
  // 8. Call revalidateTag(universityTag) outside transaction
  ```
- **FK Dependency Order**: University > Faculty > DegreeProgram (parent must exist before child restore)
- **Restricted to**: `ADMIN` and `SUPER_ADMIN` only (enforced by `withAdminAuth('data:rollback', ...)`)
- **Alternatives Considered**: PostgreSQL temporal tables — Too complex for current migration phase.
- **Risk**: Rolling back a DELETE where child records were also deleted (cascade). Phase 1 restricts rollbacks to UPDATE operations only. Full cascade rollback in Phase 2.

---

## Decision 5: Completeness Score Engine

- **Decision**: Application-layer pure function `calculateScore(university)` called post-save and result stored in a new `completenessScore Int @default(0)` column on `University`, updated asynchronously within the same transaction.
- **Rationale**: Computing scores across related tables (faculties, programs, accreditations) for 10,000+ universities during a list render causes severe N+1 performance degradation. Pre-computing and storing the score converts it to a simple integer read.
- **Implementation Notes**:
  - 14 weighted checkpoints totaling 100 points (see plan.md Section 8).
  - The `AdminCatalogService.update()` method calls `CompletenessScoreEngine.calculateScore(updated)` and includes the result in the same Prisma transaction.
  - Stale detection: `isStale = university.updatedAt < subMonths(new Date(), 6)` — computed at query time, no DB storage needed.
- **Alternatives Considered**: PostgreSQL materialized views — Requires manual refresh triggers, adds Prisma query complexity.
- **Risk**: Score staleness if update transaction fails partially. Nightly background job recalculates scores for entities updated in the last 24h.

---

## Decision 6: Bulk Operations Architecture

- **Decision**: Chunked Prisma `$transaction` batches (max 100 records per chunk) with `createMany` for audit log insertion. Returns `BulkOperationResult` detailing success/failure per ID.
- **Rationale**: Prisma has practical limits on transaction size. Chunking prevents memory spikes and transaction timeouts while maintaining atomicity within each chunk.
- **Implementation Notes**:
  ```typescript
  async function bulkUpdateStatus(ids: string[], status: PublishStatus, ctx: UserContext) {
    const chunks = chunk(ids, 100); // lodash chunk
    const results: BulkOperationResult = { succeeded: [], failed: [] };
    
    for (const chunkIds of chunks) {
      try {
        await prisma.$transaction(async (tx) => {
          const existing = await tx.university.findMany({ where: { id: { in: chunkIds } } });
          await tx.university.updateMany({ where: { id: { in: chunkIds } }, data: { publishStatus: status } });
          await tx.auditLog.createMany({
            data: existing.map(u => ({
              actorId: ctx.id, actorEmail: ctx.email,
              action: status === 'PUBLISHED' ? 'BULK_PUBLISH' : 'BULK_ARCHIVE',
              entityType: 'UNIVERSITY', entityId: u.id,
              beforeState: u, afterState: { ...u, publishStatus: status },
            }))
          });
        });
        results.succeeded.push(...chunkIds);
      } catch {
        results.failed.push(...chunkIds);
      }
    }
    return results;
  }
  ```
- **Alternatives Considered**: Raw SQL `UPDATE WHERE id IN (...)` — Loses Prisma type safety.
- **Risk**: Cross-chunk partial failures — Handled by returning granular `succeeded`/`failed` arrays with UI feedback.

---

## Decision 7: AdminNotification Fan-out

- **Decision**: Synchronous `prisma.adminNotification.createMany()` within the same Server Action transaction, targeting all users with the relevant permission.
- **Rationale**: For a platform with tens (not millions) of admin users, synchronous DB inserts into the notification table are fast enough to execute within the Server Action request cycle.
- **Implementation Notes**:
  ```typescript
  // NotificationService.notifyAdminsWithPermission(permissionCode, notification)
  const eligibleUserIds = await prisma.userRoleAssignment.findMany({
    where: { role: { permissions: { some: { permission: { code: permissionCode } } } } },
    select: { userId: true }
  });
  await prisma.adminNotification.createMany({
    data: eligibleUserIds.map(({ userId }) => ({ userId, ...notification }))
  });
  ```
- **Alternatives Considered**: Queue (SQS/BullMQ) — Overkill for current team size and user count.
- **Risk**: Notification spam on high-frequency submissions. Mitigated by rate-limiting suggestion submissions at the Server Action level (1 suggestion per user per university per 24h).

---

## Decision 8: Prisma Schema Migration Strategy

- **Decision**: Purely additive migration. New tables added via `prisma migrate dev`. Existing `UserRole` enum and `User.role` field preserved untouched. Bootstrap seed script populates new tables and syncs the legacy field.
- **Rationale**: Zero-downtime deployment requires backward-compatible schema changes. Old admin layouts checking `session.user.role` continue to function throughout the transition.
- **Migration Sequence**:
  1. `prisma migrate dev --name add-rbac-tables` — creates new tables
  2. `npm run db:seed` — seeds 6 default roles, 13 permissions, assigns SUPER_ADMIN
  3. Server Actions gradually migrated to use `withAdminAuth` HOC
  4. Old `requireAdmin()` patterns removed after full HOC migration validation
- **Alternatives Considered**: Enum value renaming (`EDITOR` -> `CONTENT_EDITOR`) — PostgreSQL enum alterations require full table rewrites, unacceptable for production.
- **Risk**: Drift between legacy `user.role` and new assignments during transition. Mitigated by bootstrap script syncing both and middleware using new system as primary authority.

---

## Decision 9: UI Component Architecture

- **Decision**: TanStack Table (headless) integrated with shadcn/ui primitives for the DataTable. Server Components fetch initial data; client components handle interactivity (selection, bulk action bar).
- **Rationale**: RSC data fetching gives fast initial page loads with no client-side fetch waterfall. TanStack Table handles complex column logic (sorting, selection, pagination) without a heavy grid library.
- **Component Architecture**:
  - `<DataTable>` — generic RSC wrapper that accepts `columns` + initial `data`
  - `<DataTableClient>` — "use client" wrapper using TanStack Table for selection state
  - `<BulkActionBar>` — `fixed bottom-4 inset-x-4` div animated with CSS transitions
  - `<CompletenessScore>` — SVG circle progress with Tailwind color mapping
  - `<StaleBadge>` — shadcn `Badge` with amber variant and clock icon
  - `<PermissionGuard permissionCode={...}>` — renders `null` or `<Tooltip>disabled</Tooltip>` based on `usePermission()` hook
- **Alternatives Considered**: AG Grid — 400KB+ bundle cost, overkill for standard admin tables.
- **Risk**: Client bundle bloat from TanStack Table. Mitigated by code-splitting the client wrapper.

---

## Decision 10: Data Table Performance

- **Decision**: Offset pagination for admin dashboard views (page/limit), with composite DB indexes on commonly filtered/sorted columns. Cursor pagination reserved for audit logs (infinite scroll acceptable there).
- **Rationale**: Admin users expect explicit page numbers and total counts for data management tasks. Offset pagination is acceptable for 10,000–50,000 records with proper indexes (P95 < 500ms verified).
- **Required Indexes**:
  - `@@index([publishStatus, updatedAt])` on `University`
  - `@@index([status, createdAt])` on `User`
  - `@@index([createdAt])` on `AuditLog` (for time-range filtering)
  - `@@index([entityType, entityId])` on `AuditLog` (already exists)
- **Alternatives Considered**: Keyset/cursor pagination — Better for deep pages but complicates "jump to page N" UX that admin users expect.
- **Risk**: Deep offset degradation at page 500+ (50K records). Acceptable for current data scale; upgrade to keyset if catalog exceeds 100K universities.
