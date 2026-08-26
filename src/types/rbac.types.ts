import { RoleDTO } from "./role.types";

export type PermissionCode =
  | "roles:manage"
  | "users:manage_admins"
  | "users:manage_staff"
  | "universities:create_delete"
  | "universities:edit_global"
  | "universities:edit_scoped"
  | "content:draft"
  | "content:publish"
  | "data:rollback"
  | "data:bulk_mutate"
  | "moderation:review"
  | "audit:view"
  | "data:export_snapshot";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: 403 | 400 | 404 | 409 | 500; errors?: Record<string, string[]> };

export interface UserContext {
  id: string;
  email: string;
  name: string;
  status: "ACTIVE" | "SUSPENDED";
  roles: RoleDTO[];
  permissions: Set<PermissionCode>;
  assignedUniversityIds: string[] | "GLOBAL";
  hierarchyLevel: number;
}
