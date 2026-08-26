import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IRoleRepository } from "../repositories/interfaces/IRoleRepository";
import { IUserRoleAssignmentRepository } from "../repositories/interfaces/IUserRoleAssignmentRepository";
import { IAuditLogRepository } from "../repositories/interfaces/IAuditLogRepository";
import { UserContext } from "../../types/rbac.types";
import { AdminUserDTO, UserFilters, UserStatus } from "../../types/user.types";
import { PromoteUserInput, SetUserStatusInput } from "../../schemas/user.schema";

export class UserManagementService {
  constructor(
    private userRepo: IUserRepository,
    private roleRepo: IRoleRepository,
    private assignmentRepo: IUserRoleAssignmentRepository,
    private auditRepo: IAuditLogRepository
  ) {}

  async searchUsers(filters?: UserFilters, page = 1, limit = 20): Promise<{ data: AdminUserDTO[]; total: number }> {
    return this.userRepo.findMany(filters, page, limit);
  }

  async getUserDetails(id: string): Promise<AdminUserDTO | null> {
    return this.userRepo.findAdminUserById(id);
  }

  async promoteUser(actor: UserContext, input: PromoteUserInput): Promise<void> {
    const targetUser = await this.userRepo.findAdminUserById(input.userId);
    if (!targetUser) throw new Error("Target user not found");

    const targetRole = await this.roleRepo.findById(input.roleId);
    if (!targetRole) throw new Error("Target role not found");

    // Hierarchical Privilege Safeguard:
    // Actor cannot assign a role with a hierarchyLevel strictly lower (higher power) or equal to their own, unless SUPER_ADMIN (level 0)
    if (actor.hierarchyLevel > 0 && targetRole.hierarchyLevel <= actor.hierarchyLevel) {
      throw new Error(`Privilege violation: You cannot assign a role with level ${targetRole.hierarchyLevel} (your level: ${actor.hierarchyLevel})`);
    }

    // Only SUPER_ADMIN can assign SUPER_ADMIN role (level 0)
    if (targetRole.hierarchyLevel === 0 && actor.hierarchyLevel !== 0) {
      throw new Error("Only Super Administrators can create or promote Super Admin accounts");
    }

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    await this.assignmentRepo.assignRole(
      input.userId,
      input.roleId,
      actor.id,
      input.universityIds,
      expiresAt
    );

    // Sync legacy enum for BetterAuth backward compatibility
    let legacyRole = "STUDENT";
    if (targetRole.key === "SUPER_ADMIN") legacyRole = "SUPER_ADMIN";
    else if (targetRole.key === "ADMIN") legacyRole = "ADMIN";
    else if (targetRole.key === "CONTENT_EDITOR" || targetRole.key === "UNIVERSITY_REP") legacyRole = "EDITOR";

    await this.userRepo.updateRole(targetUser.id, legacyRole);

    await this.auditRepo.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "ROLE_ASSIGN",
      entityType: "USER",
      entityId: targetUser.id,
      beforeState: { roles: targetUser.roles.map(r => r.key) },
      afterState: { addedRole: targetRole.key, universityIds: input.universityIds },
    });
  }

  async revokeRole(actor: UserContext, userId: string, roleId: string): Promise<void> {
    const targetUser = await this.userRepo.findAdminUserById(userId);
    if (!targetUser) throw new Error("Target user not found");

    const targetRole = await this.roleRepo.findById(roleId);
    if (!targetRole) throw new Error("Target role not found");

    // Sole Super Admin Safeguard
    if (targetRole.key === "SUPER_ADMIN") {
      const activeCount = await this.userRepo.countActiveSuperAdmins();
      if (activeCount <= 1 && targetUser.roles.some(r => r.key === "SUPER_ADMIN")) {
        throw new Error("Platform Lockout Safeguard: Cannot revoke the role of the sole remaining Super Administrator");
      }
    }

    // Hierarchical Privilege Check
    if (actor.hierarchyLevel > 0 && targetRole.hierarchyLevel <= actor.hierarchyLevel) {
      throw new Error("Privilege violation: You cannot revoke roles of equal or higher hierarchy");
    }

    await this.assignmentRepo.revokeRole(userId, roleId);

    await this.auditRepo.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "ROLE_REVOKE",
      entityType: "USER",
      entityId: userId,
      beforeState: { revokedRole: targetRole.key },
      afterState: { active: true },
    });
  }

  async setUserStatus(actor: UserContext, input: SetUserStatusInput): Promise<void> {
    const targetUser = await this.userRepo.findAdminUserById(input.userId);
    if (!targetUser) throw new Error("Target user not found");

    // Sole Super Admin Safeguard for suspension
    if (input.status === "SUSPENDED" && targetUser.roles.some(r => r.key === "SUPER_ADMIN")) {
      const activeCount = await this.userRepo.countActiveSuperAdmins();
      if (activeCount <= 1) {
        throw new Error("Platform Lockout Safeguard: Cannot suspend the sole remaining Super Administrator");
      }
    }

    // Hierarchical check
    const targetMinHierarchy = targetUser.roles.reduce((min, r) => Math.min(min, r.hierarchyLevel), 1000);
    if (actor.hierarchyLevel > 0 && targetMinHierarchy <= actor.hierarchyLevel) {
      throw new Error("Privilege violation: You cannot modify status of users with equal or higher authority");
    }

    await this.userRepo.updateStatus(input.userId, input.status);

    await this.auditRepo.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "STATUS_CHANGE",
      entityType: "USER",
      entityId: input.userId,
      beforeState: { status: targetUser.status },
      afterState: { status: input.status, reason: input.reason },
    });
  }
}
