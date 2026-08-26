import { IRoleRepository } from "../repositories/interfaces/IRoleRepository";
import { IPermissionRepository } from "../repositories/interfaces/IPermissionRepository";
import { IAuditLogRepository } from "../repositories/interfaces/IAuditLogRepository";
import { UserContext } from "../../types/rbac.types";
import { RoleWithPermissionsDTO, PermissionDTO } from "../../types/role.types";
import { CreateRoleInput, UpdateRoleInput } from "../../schemas/role.schema";

export class RoleManagementService {
  constructor(
    private roleRepo: IRoleRepository,
    private permissionRepo: IPermissionRepository,
    private auditRepo: IAuditLogRepository
  ) {}

  async getAllRoles(): Promise<RoleWithPermissionsDTO[]> {
    return this.roleRepo.findAll();
  }

  async getAllPermissions(): Promise<PermissionDTO[]> {
    return this.permissionRepo.findAll();
  }

  async getRoleDetails(id: string): Promise<RoleWithPermissionsDTO | null> {
    return this.roleRepo.findById(id);
  }

  async createCustomRole(actor: UserContext, input: CreateRoleInput): Promise<RoleWithPermissionsDTO> {
    if (actor.hierarchyLevel !== 0) {
      throw new Error("Only Super Administrators (Hierarchy 0) can define new dynamic roles");
    }

    const existing = await this.roleRepo.findByKey(input.key);
    if (existing) {
      throw new Error(`Role key [${input.key}] already exists`);
    }

    const role = await this.roleRepo.create(input);

    await this.auditRepo.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "CREATE",
      entityType: "ROLE",
      entityId: role.id,
      beforeState: null,
      afterState: { key: role.key, name: role.name, permissions: input.permissionCodes },
    });

    return role;
  }

  async updateRole(actor: UserContext, input: UpdateRoleInput): Promise<RoleWithPermissionsDTO> {
    if (actor.hierarchyLevel !== 0) {
      throw new Error("Only Super Administrators can modify role definitions");
    }

    const existing = await this.roleRepo.findById(input.id);
    if (!existing) throw new Error("Role not found");

    if (existing.isSystemDefault && input.hierarchyLevel !== undefined && input.hierarchyLevel !== existing.hierarchyLevel) {
      throw new Error("Cannot alter hierarchyLevel of core system default roles");
    }

    const updated = await this.roleRepo.update(input.id, input);

    await this.auditRepo.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "UPDATE",
      entityType: "ROLE",
      entityId: input.id,
      beforeState: existing as any,
      afterState: updated as any,
    });

    return updated;
  }

  async deleteCustomRole(actor: UserContext, id: string): Promise<void> {
    if (actor.hierarchyLevel !== 0) {
      throw new Error("Only Super Administrators can delete roles");
    }

    const existing = await this.roleRepo.findById(id);
    if (!existing) throw new Error("Role not found");

    if (existing.isSystemDefault) {
      throw new Error(`System Default Role [${existing.name}] is protected against deletion`);
    }

    if ((existing.userCount ?? 0) > 0) {
      throw new Error(`Cannot delete role [${existing.name}] because it is currently assigned to ${existing.userCount} user(s). Reassign them first.`);
    }

    await this.roleRepo.delete(id);

    await this.auditRepo.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "DELETE",
      entityType: "ROLE",
      entityId: id,
      beforeState: existing as any,
      afterState: null,
    });
  }
}
