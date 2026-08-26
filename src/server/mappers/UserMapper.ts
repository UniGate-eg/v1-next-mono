import { UserDTO, AdminUserDTO } from "../../types/user.types";
import { RoleMapper } from "./RoleMapper";

export class UserMapper {
  static toDTO(user: any): UserDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image ?? null,
      role: user.role,
      status: user.status ?? "ACTIVE",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toAdminDTO(user: any): AdminUserDTO {
    const base = UserMapper.toDTO(user);
    const assignments = user.roleAssignments || [];
    const roles = assignments.map((a: any) => RoleMapper.toDTO(a.role)).filter(Boolean);
    const assignedUniversityIds = assignments.flatMap((a: any) =>
      (a.institutionAssignments || []).map((ia: any) => ia.universityId)
    );
    const assignedUniversities = assignments.flatMap((a: any) =>
      (a.institutionAssignments || []).map((ia: any) => ia.university).filter(Boolean)
    );

    return {
      ...base,
      roles,
      assignedUniversityIds,
      assignedUniversities,
    };
  }
}
