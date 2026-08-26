import { RoleDTO } from "../../../types/role.types";
import { PermissionCode } from "../../../types/rbac.types";

export interface RoleAssignmentRecord {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt: Date | null;
  role: RoleDTO & { permissions: Array<{ permission: { code: string } }> };
  institutionAssignments: Array<{ universityId: string }>;
}

export interface IUserRoleAssignmentRepository {
  assignRole(userId: string, roleId: string, assignedBy: string, universityIds?: string[], expiresAt?: Date | null): Promise<void>;
  revokeRole(userId: string, roleId: string): Promise<void>;
  findAssignmentsForUser(userId: string): Promise<RoleAssignmentRecord[]>;
  findUsersWithPermission(permissionCode: PermissionCode): Promise<string[]>;
}
