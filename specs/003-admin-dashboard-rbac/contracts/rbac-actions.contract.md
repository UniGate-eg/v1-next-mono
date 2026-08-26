# Contract: RBAC Server Actions

**Feature**: `003-admin-dashboard-rbac`
**Date**: 2026-08-26

## Overview

All administrative Server Actions in the UniGate Admin Dashboard use the `withAdminAuth` Higher-Order Function wrapper. This contract defines the standard input/output types, error codes, and permission requirements for all actions.

## ActionResult<T> Type

```typescript
// src/types/rbac.types.ts
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: 403 | 400 | 500 };

export type PermissionCode =
  | 'roles:manage'
  | 'users:manage_admins'
  | 'users:manage_staff'
  | 'universities:create_delete'
  | 'universities:edit_global'
  | 'universities:edit_scoped'
  | 'content:draft'
  | 'content:publish'
  | 'data:rollback'
  | 'data:bulk_mutate'
  | 'moderation:review'
  | 'audit:view'
  | 'data:export_snapshot';

export interface UserContext {
  id: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  roles: RoleDTO[];
  permissions: Set<PermissionCode>;
  assignedUniversityIds: string[] | 'GLOBAL';
  hierarchyLevel: number; // minimum level across all assigned roles
}
```

## Error Codes

| Code | Condition |
|:---|:---|
| 403 | Unauthenticated, suspended account, insufficient permissions, scope violation |
| 400 | Zod validation failure on input |
| 500 | Unexpected server error (logged server-side) |

## withAdminAuth HOC Contract

```typescript
// Signature
function withAdminAuth<TInput, TOutput>(
  permissionCode: PermissionCode,
  handler: (ctx: UserContext, input: TInput) => Promise<TOutput>,
  opts?: { universityIdExtractor?: (input: TInput) => string | undefined }
): (input: TInput) => Promise<ActionResult<TOutput>>;

// Execution Steps (guaranteed order):
// 1. Parse BetterAuth session cookie -> if missing: 403
// 2. Live DB fetch: prisma.user.findUnique({ id: session.user.id })
//    -> if not found or status === 'SUSPENDED': revoke session, return 403
// 3. React cache() memoized permission check (per-request, not cross-request)
//    -> if permissionCode not in user's permissions: return 403
// 4. If universityIdExtractor provided: validate institution scope
// 5. Execute handler(ctx, input) inside try/catch
//    -> on success: return { success: true, data }
//    -> on error: log error, return { success: false, error, code: 500 }
```

## Example Usage

```typescript
// user.admin.actions.ts
export const promoteUserAction = withAdminAuth(
  'users:manage_staff',
  async (ctx, input: PromoteUserInput) => {
    const validated = PromoteUserSchema.parse(input);
    return UserManagementService.promoteUser(ctx, validated);
  }
);

// rollback.admin.actions.ts
export const rollbackEntityAction = withAdminAuth(
  'data:rollback',
  async (ctx, input: { auditLogId: string }) => {
    return RollbackService.execute(input.auditLogId, ctx.id);
  }
);

// bulk.admin.actions.ts
export const bulkPublishAction = withAdminAuth(
  'data:bulk_mutate',
  async (ctx, input: { universityIds: string[] }) => {
    const validated = BulkActionSchema.parse(input);
    return BulkOperationService.bulkUpdateStatus(validated.universityIds, 'PUBLISHED', ctx);
  }
);
```
