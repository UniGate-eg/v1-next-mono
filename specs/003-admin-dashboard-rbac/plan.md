# Implementation Plan: Unified Admin Dashboard & Extensible RBAC

| Field | Value |
|:---|:---|
| **Feature ID** | `003-admin-dashboard-rbac` |
| **Branch** | `003-admin-dashboard-rbac` |
| **Date** | 2026-08-26 |
| **Spec** | [spec.md](spec.md) |
| **Data Model** | [data-model.md](data-model.md) |
| **Research** | [research.md](research.md) |
| **Status** | Implementation Ready |

---

## 1. Executive Summary

This plan transforms the existing static-enum RBAC system into a **Zero-Trust, Database-Driven Dynamic RBAC platform** backed by a world-class Admin Dashboard. The architecture follows FAANG principal-engineer standards supporting the full 5-tier role hierarchy, atomic rollbacks, real-time live session defense, automated data quality monitoring, in-app notifications, and bulk catalog operations — all on the existing Next.js 15 / Prisma / PostgreSQL / BetterAuth stack with **zero breaking changes** to existing functionality.

**Total scope**: 6 implementation phases, ~4–6 weeks of full-stack development.

---

## 2. Technical Context

| Concern | Choice | Version |
|:---|:---|:---|
| Language | TypeScript (Strict Mode) | 5.8+ |
| Runtime | Node.js | 20 LTS |
| Framework | Next.js App Router | 15.x |
| ORM | Prisma | 6.4.x |
| Database | PostgreSQL | 16+ |
| Auth | BetterAuth | Latest stable |
| Validation | Zod | 3.24+ |
| Testing | Vitest | 3.2+ |
| UI | shadcn/ui + Tailwind CSS v4 | Latest |
| State | Zustand | 5.0 |

### Performance Budget

| Metric | Target |
|:---|:---|
| Admin page load (P95) | < 500ms |
| Permission check overhead per action | < 50ms |
| Rollback execution (DB + cache) | < 2.0s |
| Bulk operation: 50 records | < 3.0s |
| Session revocation enforcement | < 50ms on next request |
| Cache invalidation post-mutation | < 2.0s |

---

## 3. Architecture: FAANG-Grade SOLID Design

### 3.1 Layered Architecture

```
+-----------------------------------------------------------------------+
|  PRESENTATION LAYER (React Server + Client Components)                |
|  Dashboard Hub, User Mgmt, Catalog Editor, Audit Log, Moderation      |
|  DataTable, NotificationDrawer, BulkActionBar, PermissionGuard        |
+-----------------------------------------------------------------------+
|  APPLICATION LAYER (Next.js Server Actions + withAdminAuth HOC)       |
|  All mutations wrapped in withAdminAuth(permissionCode, handler)       |
|  Typed ActionResult<T> = { success, data } | { success, error, code } |
|  Zod validation at every Server Action entry point                    |
+-----------------------------------------------------------------------+
|  SECURITY GATE (Live DB Permission Check -- Zero Trust)               |
|  RbacService.hasPermission(userId, code, universityId?)               |
|  Queries live PostgreSQL -- never trusts session token alone           |
|  Returns 403 + invalidates session on suspended/demoted actors        |
+-----------------------------------------------------------------------+
|  DOMAIN / SERVICE LAYER                                               |
|  UserManagementService, RbacService, AdminCatalogService              |
|  RollbackService, BulkOperationService, NotificationService           |
|  CompletenessScoreEngine, AuditService                                |
+-----------------------------------------------------------------------+
|  REPOSITORY LAYER (Interface-driven, DI-composed)                     |
|  IUserRepository, IRoleRepository, IPermissionRepository              |
|  IUserRoleAssignmentRepository, IAdminNotificationRepository          |
|  IAuditLogRepository (INSERT-ONLY -- enforced at interface level)     |
+-----------------------------------------------------------------------+
|  INFRASTRUCTURE LAYER                                                 |
|  PrismaClient singleton, BetterAuth, env validation (t3-env)         |
|  revalidateTag / revalidatePath ISR invalidation                      |
|  prisma/seed.ts (CLI-only Bootstrap Provisioner)                      |
+-----------------------------------------------------------------------+
```

### 3.2 SOLID Principle Map

| Principle | Application |
|:---|:---|
| **S — Single Responsibility** | `RbacService` checks permissions only. `AuditService` emits logs only. `RollbackService` executes reversions only. `CompletenessScoreEngine` computes scores only. `NotificationService` fans out alerts only. |
| **O — Open/Closed** | Adding a new permission = new seed record, zero code changes. New notification type = new enum value + handler. New rollback strategy = new class implementing `IRollbackStrategy`. |
| **L — Liskov Substitution** | All repository implementations interchangeable via interfaces. `MockRoleRepository` in tests is fully substitutable for `PostgresRoleRepository`. |
| **I — Interface Segregation** | `IUserReader` (list/search) separate from `IUserWriter` (promote/suspend). `IAuditLogRepository` exposes only `create()` -- never update/delete. |
| **D — Dependency Inversion** | All services declare repository dependencies as interface-typed constructor parameters. Composition root `src/lib/di.ts` wires concrete Prisma implementations. Zero `import { prisma }` inside service classes. |

### 3.3 Design Patterns

| Pattern | Usage |
|:---|:---|
| **Repository Pattern** | All DB access via typed repository classes. Zero raw `prisma.*` in services or actions. |
| **Mapper Pattern** | `UserMapper`, `RoleMapper`, `AdminNotificationMapper` — strict DB -> DTO -> ClientDTO transformations. |
| **Higher-Order Function** | `withAdminAuth(permissionCode, handler)` wraps every Server Action with live auth + typed `ActionResult<T>`. |
| **Strategy Pattern** | `IRollbackStrategy` allows per-entity-type rollback handlers (UniversityRollback, FacultyRollback, ProgramRollback). |
| **Command Pattern** | Each mutation constructs an `AdminCommand<T>` with `execute()`, `audit()`, `invalidateCache()` -- separating concerns. |
| **Observer Pattern** | `MutationEventBus.emit('university.updated', payload)` -> `NotificationObserver`, `CacheObserver`, `AuditObserver` listen. |
| **Factory Pattern** | `RollbackStrategyFactory.forEntityType(type)` returns the correct `IRollbackStrategy`. |
| **Decorator Pattern** | `CachedUserRepository` wraps `IUserReader` adding transparent Next.js cache tagging. |

---

## 4. Directory Structure

### Documentation

```
specs/003-admin-dashboard-rbac/
+-- plan.md
+-- research.md
+-- data-model.md
+-- contracts/
|   +-- rbac-actions.contract.md
|   +-- user-management.contract.md
|   +-- rollback.contract.md
|   +-- notification.contract.md
+-- tasks.md              (Phase 2 output -- speckit-tasks command)
```

### Source Code Layout

```
src/
+-- app/
|   +-- admin/
|   |   +-- layout.tsx                        [MODIFY] PermissionContext + live user load
|   |   +-- page.tsx                          [MODIFY] Role-tailored KPI dashboard
|   |   +-- users/
|   |   |   +-- page.tsx                      [NEW] User Management table
|   |   |   +-- [id]/page.tsx                 [NEW] User profile + role assignment
|   |   +-- roles/
|   |   |   +-- page.tsx                      [NEW] Dynamic Role Management (SUPER_ADMIN)
|   |   |   +-- [id]/page.tsx                 [NEW] Role editor + permission toggles
|   |   +-- universities/
|   |   |   +-- page.tsx                      [MODIFY] Completeness scores + bulk select
|   |   |   +-- new/page.tsx                  [MODIFY] Permission gating
|   |   |   +-- [id]/page.tsx                 [MODIFY] Scoped mutability + quality badge
|   |   |   +-- [id]/faculties/page.tsx       [MODIFY] Scope enforcement
|   |   |   +-- [id]/programs/page.tsx        [MODIFY] Scope enforcement
|   |   +-- suggestions/page.tsx              [MODIFY] Scope-filtered moderation queue
|   |   +-- audit-log/page.tsx                [MODIFY] Add rollback trigger column
|   |   +-- notifications/page.tsx            [NEW] Notification center
|
+-- components/
|   +-- admin/
|   |   +-- layout/
|   |   |   +-- AdminSidebar.tsx              [MODIFY] Role-aware nav links
|   |   |   +-- AdminHeader.tsx               [MODIFY] Add NotificationBell
|   |   |   +-- NotificationBell.tsx          [NEW] Unread badge + dropdown drawer
|   |   +-- shared/
|   |   |   +-- DataTable.tsx                 [NEW] Role-aware with bulk select
|   |   |   +-- BulkActionBar.tsx             [NEW] Floating batch action bar
|   |   |   +-- CompletenessScore.tsx         [NEW] 0-100% progress ring + badge
|   |   |   +-- StaleBadge.tsx                [NEW] "Needs Annual Review" chip
|   |   |   +-- PermissionGuard.tsx           [NEW] Client-side permission gate HOC
|   |   |   +-- ConfirmationModal.tsx         [NEW] Generic destructive action modal
|   |   +-- users/
|   |   |   +-- UserTable.tsx                 [NEW] Staff list with search + filters
|   |   |   +-- RoleAssignmentSheet.tsx       [NEW] Role + institution scope assignment
|   |   |   +-- UserStatusToggle.tsx          [NEW] Suspend/Activate confirmation
|   |   +-- roles/
|   |   |   +-- RoleEditor.tsx                [NEW] Create/edit role with permission grid
|   |   |   +-- PermissionGrid.tsx            [NEW] Toggle matrix for all permission codes
|   |   +-- universities/
|   |   |   +-- UniversityForm.tsx            [MODIFY] Scope-aware field locking
|   |   |   +-- RollbackDialog.tsx            [NEW] Rollback confirm + pre-flight result
|   |   +-- audit/
|   |   |   +-- AuditLogTable.tsx             [MODIFY] Diff viewer + rollback button
|   |   +-- suggestions/
|   |       +-- SuggestionDiffViewer.tsx      [MODIFY] Side-by-side diff enhancement
|
+-- server/
|   +-- actions/
|   |   +-- admin/
|   |   |   +-- user.admin.actions.ts         [NEW] Promote, suspend, revoke role
|   |   |   +-- role.admin.actions.ts         [NEW] Create, update, delete custom roles
|   |   |   +-- university.admin.actions.ts   [MODIFY] Wrap in withAdminAuth HOC
|   |   |   +-- faculty.actions.ts            [MODIFY] Wrap in withAdminAuth HOC
|   |   |   +-- program.actions.ts            [MODIFY] Wrap in withAdminAuth HOC
|   |   |   +-- rollback.admin.actions.ts     [NEW] Atomic rollback trigger
|   |   |   +-- bulk.admin.actions.ts         [NEW] Bulk publish / archive / export
|   |   |   +-- suggestion.admin.actions.ts   [MODIFY] Wrap in withAdminAuth HOC
|   |   +-- withAdminAuth.ts                  [NEW] HOC: live DB guard + ActionResult<T>
|   |
|   +-- services/
|   |   +-- RbacService.ts                    [NEW] hasPermission() + buildUserContext()
|   |   +-- UserManagementService.ts          [NEW] Promote, suspend, hierarchy checks
|   |   +-- RollbackService.ts                [NEW] Atomic rollback engine
|   |   +-- RollbackStrategyFactory.ts        [NEW] Strategy selector by entityType
|   |   +-- BulkOperationService.ts           [NEW] Transactional bulk mutations
|   |   +-- CompletenessScoreEngine.ts        [NEW] 0-100% scoring logic (pure fn)
|   |   +-- NotificationService.ts            [NEW] Fan-out notification creation
|   |   +-- AdminCatalogService.ts            [NEW] Scoped mutation + quality scoring
|   |   +-- AuditService.ts                   [MODIFY] Add ROLLBACK + BULK action types
|   |   +-- AdminUniversityService.ts         [MODIFY] Delegate to AdminCatalogService
|   |   +-- SuggestionService.ts              [MODIFY] Trigger notifications on submit
|   |
|   +-- repositories/
|   |   +-- interfaces/
|   |   |   +-- IUserRepository.ts            [NEW] IUserReader + IUserWriter
|   |   |   +-- IRoleRepository.ts            [NEW]
|   |   |   +-- IPermissionRepository.ts      [NEW]
|   |   |   +-- IUserRoleAssignmentRepository.ts [NEW]
|   |   |   +-- IAdminNotificationRepository.ts  [NEW]
|   |   |   +-- IAuditLogRepository.ts        [MODIFY] Add findByEntityId() for rollback
|   |   +-- PostgresUserRepository.ts         [NEW]
|   |   +-- PostgresRoleRepository.ts         [NEW]
|   |   +-- PostgresPermissionRepository.ts   [NEW]
|   |   +-- PostgresUserRoleAssignmentRepository.ts [NEW]
|   |   +-- PostgresAdminNotificationRepository.ts  [NEW]
|   |   +-- AuditLogRepository.ts             [MODIFY] Add rollback-query methods
|   |
|   +-- mappers/
|       +-- UserMapper.ts                     [NEW] DB User -> UserDTO -> AdminUserDTO
|       +-- RoleMapper.ts                     [NEW]
|       +-- AdminNotificationMapper.ts        [NEW]
|
+-- schemas/
|   +-- user.schema.ts                        [NEW] PromoteUserSchema, SuspendUserSchema
|   +-- role.schema.ts                        [NEW] CreateRoleSchema, UpdateRoleSchema
|   +-- bulk.schema.ts                        [NEW] BulkActionSchema
|
+-- types/
|   +-- rbac.types.ts                         [NEW] UserContext, PermissionCode, ActionResult<T>
|   +-- user.types.ts                         [NEW] UserDTO, AdminUserDTO
|   +-- role.types.ts                         [NEW] RoleDTO, PermissionDTO
|   +-- notification.types.ts                 [NEW] AdminNotificationDTO
|
+-- lib/
|   +-- di.ts                                 [MODIFY] Wire new repositories + services
|   +-- auth.ts                               [MODIFY] Expose user.status in session
|
+-- hooks/
|   +-- usePermission.ts                      [NEW] Client-side permission check hook
|   +-- useNotifications.ts                   [NEW] Polling for notification badge
|
+-- contexts/
    +-- PermissionContext.tsx                 [NEW] Server -> client permission bridge

prisma/
+-- schema.prisma                             [MODIFY] Additive new models + enums
+-- seed.ts                                   [MODIFY] Bootstrap provisioning protocol
```

---

## 5. Prisma Schema Additions (Additive-Only -- Zero Breaking Changes)

> **Strategy**: All changes are purely additive. The existing `UserRole` enum and `role` field on `User` are preserved for BetterAuth compatibility. New dynamic RBAC tables operate in parallel.

### New Enums
```prisma
enum UserStatus {
  ACTIVE
  SUSPENDED
}

enum NotificationType {
  NEW_SUGGESTION
  DRAFT_SUBMITTED
  MODERATION_DECISION
  ROLE_CHANGE
  SYSTEM_ALERT
}
```

### User Model Extension (Additive)
```prisma
// MODIFY: Add to existing User model
status              UserStatus          @default(ACTIVE)
roleAssignments     UserRoleAssignment[]
adminNotifications  AdminNotification[]
```

### New Models
```prisma
model Role {
  id              String               @id @default(cuid())
  key             String               @unique
  name            String
  description     String?
  hierarchyLevel  Int                  @default(100)  // 0 = highest authority
  isSystemDefault Boolean              @default(false)
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
  permissions     RolePermission[]
  userAssignments UserRoleAssignment[]
  @@index([hierarchyLevel])
  @@map("roles")
}

model Permission {
  id          String           @id @default(cuid())
  code        String           @unique
  domain      String
  action      String
  description String?
  createdAt   DateTime         @default(now())
  roles       RolePermission[]
  @@index([domain])
  @@map("permissions")
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
  @@map("role_permissions")
}

model UserRoleAssignment {
  id           String                @id @default(cuid())
  userId       String
  roleId       String
  assignedBy   String
  assignedAt   DateTime              @default(now())
  expiresAt    DateTime?
  user         User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  role         Role                  @relation(fields: [roleId], references: [id], onDelete: Cascade)
  institutionAssignments InstitutionAssignment[]
  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
  @@map("user_role_assignments")
}

model InstitutionAssignment {
  id                   String             @id @default(cuid())
  userRoleAssignmentId String
  universityId         String
  userRoleAssignment   UserRoleAssignment @relation(fields: [userRoleAssignmentId], references: [id], onDelete: Cascade)
  university           University         @relation(fields: [universityId], references: [id], onDelete: Cascade)
  @@unique([userRoleAssignmentId, universityId])
  @@index([universityId])
  @@map("institution_assignments")
}

model AdminNotification {
  id        String           @id @default(cuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  link      String?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("admin_notifications")
}
```

---

## 6. Security Architecture: `withAdminAuth` HOC

```typescript
// src/server/actions/withAdminAuth.ts

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: 403 | 400 | 500 };

export type PermissionCode =
  | 'roles:manage' | 'users:manage_admins' | 'users:manage_staff'
  | 'universities:create_delete' | 'universities:edit_global' | 'universities:edit_scoped'
  | 'content:draft' | 'content:publish' | 'data:rollback' | 'data:bulk_mutate'
  | 'moderation:review' | 'audit:view' | 'data:export_snapshot';

export function withAdminAuth<TInput, TOutput>(
  permissionCode: PermissionCode,
  handler: (ctx: UserContext, input: TInput) => Promise<TOutput>,
  opts?: { universityIdExtractor?: (input: TInput) => string | undefined }
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    // Step 1: Verify session cookie
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthenticated', code: 403 };

    // Step 2: LIVE DB check -- never trust stale session token
    const liveUser = await UserRepository.findById(session.user.id);
    if (!liveUser || liveUser.status === 'SUSPENDED') {
      await auth.api.revokeSession({ token: session.session.token });
      return { success: false, error: 'Account suspended', code: 403 };
    }

    // Step 3: Live permission check with optional institution scope
    const universityId = opts?.universityIdExtractor?.(input);
    const permitted = await RbacService.hasPermission(liveUser.id, permissionCode, universityId);
    if (!permitted) return { success: false, error: 'Forbidden', code: 403 };

    // Step 4: Build context and execute handler
    const ctx = await RbacService.buildUserContext(liveUser);
    try {
      const data = await handler(ctx, input);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: (err as Error).message, code: 500 };
    }
  };
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation -- Schema, Seed & Security Core
**Estimated**: 5-7 days

| Task | Files | Notes |
|:---|:---|:---|
| Add new models + enums to schema.prisma | prisma/schema.prisma | Additive only |
| Generate Prisma migration | prisma/migrations/ | prisma migrate dev |
| Bootstrap seed.ts (6 roles, 13 permissions, SUPER_ADMIN) | prisma/seed.ts | One-time lock pattern |
| All 5 new repository interfaces | src/server/repositories/interfaces/ | Typed interfaces |
| All 5 new Postgres repositories | src/server/repositories/ | DI-ready |
| RbacService with hasPermission() | src/server/services/RbacService.ts | Core live permission check |
| withAdminAuth HOC | src/server/actions/withAdminAuth.ts | Zero-trust wrapper |
| Update di.ts composition root | src/lib/di.ts | Wire all new services |
| Update AdminLayout with PermissionContext | src/app/admin/layout.tsx | Live user context |
| Update middleware for /admin/* | src/middleware.ts | Route protection |

### Phase 2: User Management & Role Governance
**Estimated**: 5-7 days

| Task | Files | Notes |
|:---|:---|:---|
| UserManagementService (hierarchy + safeguards) | UserManagementService.ts | Sole-admin protection |
| Server Actions: promote, revoke, suspend | user.admin.actions.ts | withAdminAuth wrapped |
| Server Actions: create/edit/delete roles | role.admin.actions.ts | SUPER_ADMIN only |
| UserTable component | UserTable.tsx | Search + filters + pagination |
| RoleAssignmentSheet component | RoleAssignmentSheet.tsx | shadcn Sheet + multi-select |
| RoleEditor + PermissionGrid | roles/ components | Toggle matrix UI |
| /admin/users page | users/page.tsx | Paginated, role-scoped |
| /admin/roles page | roles/page.tsx | SUPER_ADMIN only |
| Zod schemas for user/role mutations | schemas/ | Strict validation |
| Unit tests: UserManagementService | __tests__/ | All hierarchy + safeguard cases |

### Phase 3: Catalog Scoping, Quality Scoring & Rollback Engine
**Estimated**: 7-10 days

| Task | Files | Notes |
|:---|:---|:---|
| CompletenessScoreEngine (14 checkpoints) | CompletenessScoreEngine.ts | Pure function, fully testable |
| Stale data detection | AdminCatalogService.ts | updatedAt > 6 months -> isStale |
| AdminCatalogService with scoped enforcement | AdminCatalogService.ts | Wraps all catalog mutations |
| Wrap all existing Server Actions in withAdminAuth | *.actions.ts | Replace requireAdmin() |
| RollbackService + IRollbackStrategy | RollbackService.ts | Per-entity handlers |
| RollbackStrategyFactory | RollbackStrategyFactory.ts | entityType -> strategy |
| Rollback Server Action | rollback.admin.actions.ts | data:rollback permission |
| CompletenessScore UI component | CompletenessScore.tsx | Progress ring + percentage |
| StaleBadge UI component | StaleBadge.tsx | Warning chip |
| RollbackDialog component | RollbackDialog.tsx | Pre-flight validation display |
| University catalog page updates | universities/page.tsx | Completeness column + filters |
| Unit tests: CompletenessScoreEngine, RollbackService | __tests__/ | FK violation edge cases |

### Phase 4: Bulk Operations & Notification System
**Estimated**: 4-5 days

| Task | Files | Notes |
|:---|:---|:---|
| BulkOperationService transactional engine | BulkOperationService.ts | Single transaction, per-record audit |
| Bulk Server Action | bulk.admin.actions.ts | data:bulk_mutate permission |
| BulkActionSchema (Zod) | bulk.schema.ts | ID array + action type |
| DataTable generic with multi-select | DataTable.tsx | Checkbox + select-all |
| BulkActionBar floating component | BulkActionBar.tsx | Animated bottom bar |
| NotificationService fan-out | NotificationService.ts | Sync insert-select pattern |
| AdminNotification repository | PostgresAdminNotificationRepository.ts | |
| Trigger notifications in SuggestionService | SuggestionService.ts | On new suggestion submit |
| NotificationBell header component | NotificationBell.tsx | Unread count + dropdown |
| /admin/notifications page | notifications/page.tsx | Paginated log |
| Unit tests: BulkOperationService | __tests__/ | Atomicity + partial failure |

### Phase 5: Dashboard Hub, UI Polish & World-Class UX
**Estimated**: 5-7 days

| Task | Files | Notes |
|:---|:---|:---|
| PermissionGuard client component | PermissionGuard.tsx | Wraps restricted UI elements |
| usePermission hook | usePermission.ts | Reads from PermissionContext |
| useNotifications polling hook | useNotifications.ts | Refreshes bell count every 30s |
| Role-tailored Dashboard KPI cards | admin/page.tsx | Different views per role tier |
| AdminSidebar role-aware navigation | AdminSidebar.tsx | Hides restricted links |
| ConfirmationModal generic component | ConfirmationModal.tsx | Danger zone pattern |
| PermissionContext server-to-client bridge | PermissionContext.tsx | From layout to client tree |
| Cursor pagination for 10K+ records | DataTable.tsx + repos | P95 < 500ms |
| Error boundaries for admin routes | */error.tsx | Graceful degradation |
| Loading skeletons for all admin pages | */loading.tsx | Suspense boundaries |
| Accessibility audit | All admin components | WCAG 2.1 AA |

### Phase 6: Testing, Bootstrap & Hardening
**Estimated**: 3-5 days

| Task | Files | Notes |
|:---|:---|:---|
| Complete bootstrap seed.ts | prisma/seed.ts | Full one-time lock + role seeding |
| Integration tests: withAdminAuth HOC | __tests__/ | Suspended, demoted, FK violation |
| Integration tests: Rollback engine | __tests__/ | Each entity type |
| Integration tests: Bulk operations | __tests__/ | 50+ records, atomicity |
| Performance benchmarks | scripts/ | All SC SLOs verified |
| Security pen-test checklist | Manual | Escalation, scope bypass, re-seeding |
| Middleware hardening | src/middleware.ts | Full /admin/* protection |
| Environment variable docs | docs/env.md | INITIAL_SUPER_ADMIN_EMAIL |

---

## 8. Completeness Score Engine

```typescript
// src/server/services/CompletenessScoreEngine.ts
interface CompletenessCheckpoint {
  field: string;
  weight: number;
  isMet: (u: UniversityWithRelations) => boolean;
}

export const CHECKPOINTS: CompletenessCheckpoint[] = [
  { field: 'nameEn',       weight: 8,  isMet: u => !!u.nameEn },
  { field: 'nameAr',       weight: 8,  isMet: u => !!u.nameAr },
  { field: 'overviewEn',   weight: 10, isMet: u => (u.overviewEn?.length ?? 0) > 100 },
  { field: 'overviewAr',   weight: 10, isMet: u => (u.overviewAr?.length ?? 0) > 100 },
  { field: 'logoUrl',      weight: 8,  isMet: u => !!u.logoUrl },
  { field: 'website',      weight: 5,  isMet: u => !!u.website },
  { field: 'governorate',  weight: 5,  isMet: u => !!u.governorate },
  { field: 'established',  weight: 5,  isMet: u => !!u.established },
  { field: 'phones',       weight: 5,  isMet: u => u.phones.length > 0 },
  { field: 'emails',       weight: 5,  isMet: u => u.emails.length > 0 },
  { field: 'faculties',    weight: 10, isMet: u => u._count.faculties > 0 },
  { field: 'programs',     weight: 10, isMet: u => u._count.degreePrograms > 0 },
  { field: 'tuition',      weight: 8,  isMet: u => u.degreePrograms.some(p => p.tuitionEgpPerYear !== null) },
  { field: 'accreditation',weight: 3,  isMet: u => u._count.accreditations > 0 },
]; // Total = 100

export function calculateScore(university: UniversityWithRelations): number {
  return CHECKPOINTS.reduce((score, cp) => score + (cp.isMet(university) ? cp.weight : 0), 0);
}
```

---

## 9. Bootstrap Provisioning Implementation

```typescript
// prisma/seed.ts (partial -- key bootstrap gates)
async function bootstrap() {
  const email = process.env.INITIAL_SUPER_ADMIN_EMAIL;
  if (!email) {
    console.log('INITIAL_SUPER_ADMIN_EMAIL not set -- skipping bootstrap.');
    return;
  }

  // GATE: One-Time Lock
  const existing = await prisma.userRoleAssignment.findFirst({
    where: { role: { key: 'SUPER_ADMIN' } }
  });
  if (existing) {
    console.log('Bootstrap locked: SUPER_ADMIN already provisioned.');
    return;
  }

  // Seed 6 default roles + 13 permissions + bindings
  await seedDefaultRolesAndPermissions(prisma);

  // Find target user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`User ${email} not found. Register first then re-run seed.`);
    return;
  }

  // Assign SUPER_ADMIN role
  const role = await prisma.role.findUnique({ where: { key: 'SUPER_ADMIN' } });
  await prisma.userRoleAssignment.create({
    data: { userId: user.id, roleId: role!.id, assignedBy: 'SYSTEM' }
  });

  // Sync legacy enum for BetterAuth compatibility
  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPER_ADMIN' }
  });

  console.log(`Super Admin provisioned: ${email}`);
}
```

---

## 10. UI/UX: World-Class Design System

### Role Tier Color System
| Role | Color | Tailwind |
|:---|:---|:---|
| SUPER_ADMIN | Indigo | bg-indigo-600 |
| ADMIN | Sky | bg-sky-600 |
| CONTENT_EDITOR | Emerald | bg-emerald-600 |
| UNIVERSITY_REP | Amber | bg-amber-600 |
| COMMUNITY_MODERATOR | Violet | bg-violet-600 |

### Component Interaction Patterns
- **DataTable**: Sticky header, checkbox per row, floating BulkActionBar animates in from bottom when rows selected
- **Permission-Gated Actions**: Disabled (never invisible) with tooltip "Requires [permission name]"
- **Completeness Score**: Ring progress: <60%=red, 60-80%=amber, >80%=green
- **Stale Badge**: Amber chip with warning icon: "Needs Annual Review"
- **Notification Bell**: Badge count, dropdown with stacked cards, "Mark all read" action
- **Rollback Dialog**: Two-column JSON diff tree (before | after), destructive CTA styling

### shadcn/ui Primitive Mapping
| Feature | Primitives |
|:---|:---|
| User Management Table | Table, Badge, DropdownMenu, Dialog |
| Role Assignment | Sheet, Select, Command (institution picker) |
| Permission Grid | Checkbox, Switch, custom grid layout |
| Notification Bell | Popover, ScrollArea, Badge |
| Rollback Dialog | Dialog, ScrollArea, custom JSON diff tree |
| Bulk Action Bar | Custom sticky div + Button group + Badge |
| Completeness Score | Custom SVG ring + Tooltip |
| Confirmation Modal | AlertDialog |
| Filter Chips | Badge variant=outline + X dismiss |

---

## 11. Constitution Check

| Gate | Status | Notes |
|:---|:---|:---|
| No breaking schema changes | PASS | All additions are additive, UserRole enum preserved |
| Single Responsibility per file | PASS | Each service/repo/component has one domain concern |
| Interface-driven repositories | PASS | All 6 new repositories implement typed interfaces |
| Zero raw prisma.* in services | PASS | All DB access via repository layer |
| All mutations audited | PASS | withAdminAuth HOC triggers audit on every mutation |
| Live DB check on every Server Action | PASS | Core withAdminAuth pattern enforces this |
| Test coverage for security paths | REQUIRED | Phase 6 integration tests cover all RBAC boundaries |
| Performance targets defined | PASS | All SLOs documented in Section 2 |

---

## 12. Verification Plan

### Automated Tests (Vitest)
```bash
npx vitest run
npx vitest run src/server/services/__tests__/RbacService.test.ts
npx vitest run src/server/services/__tests__/RollbackService.test.ts
npx vitest run src/server/services/__tests__/BulkOperationService.test.ts
npx vitest run src/server/services/__tests__/CompletenessScoreEngine.test.ts
```

### Manual Verification Scenarios
1. **Bootstrap Protocol**: Fresh DB -> npm run db:seed -> Super Admin created -> run again -> locked message
2. **Live Session Defense**: Suspend active editor mid-session -> submit form -> instant 403
3. **Hierarchical Privilege**: ADMIN promotes user to SUPER_ADMIN -> blocked
4. **Rollback**: Delete 3 programs -> audit log -> rollback -> restored + ROLLBACK audit entry
5. **Bulk Operations**: Select 50 programs -> bulk publish -> all PUBLISHED + 50 audit records
6. **Scope Enforcement**: University Rep edits unassigned university URL -> 403
7. **Completeness Score**: Create university (name only) -> 16% score -> fill all -> 100%
8. **Notification Bell**: Student submits suggestion -> admin bell increments
