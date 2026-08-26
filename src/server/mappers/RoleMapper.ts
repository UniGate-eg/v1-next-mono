import { RoleDTO, RoleWithPermissionsDTO, PermissionDTO } from "../../types/role.types";

export class RoleMapper {
  static toDTO(role: any): RoleDTO {
    return {
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description ?? null,
      hierarchyLevel: role.hierarchyLevel,
      isSystemDefault: role.isSystemDefault,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static toPermissionDTO(permission: any): PermissionDTO {
    return {
      id: permission.id,
      code: permission.code,
      domain: permission.domain,
      action: permission.action,
      description: permission.description ?? null,
      createdAt: permission.createdAt,
    };
  }

  static toRoleWithPermissionsDTO(role: any): RoleWithPermissionsDTO {
    const base = RoleMapper.toDTO(role);
    const permissions = (role.permissions || []).map((rp: any) =>
      RoleMapper.toPermissionDTO(rp.permission || rp)
    );
    const userCount = role._count?.userAssignments ?? role.userAssignments?.length;

    return {
      ...base,
      permissions,
      userCount,
    };
  }
}
