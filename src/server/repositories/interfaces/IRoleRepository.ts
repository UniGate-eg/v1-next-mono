import { RoleDTO, RoleWithPermissionsDTO, PermissionDTO } from "../../../types/role.types";
import { CreateRoleInput, UpdateRoleInput } from "../../../schemas/role.schema";

export interface IRoleRepository {
  findById(id: string): Promise<RoleWithPermissionsDTO | null>;
  findByKey(key: string): Promise<RoleWithPermissionsDTO | null>;
  findAll(): Promise<RoleWithPermissionsDTO[]>;
  create(data: CreateRoleInput): Promise<RoleWithPermissionsDTO>;
  update(id: string, data: UpdateRoleInput): Promise<RoleWithPermissionsDTO>;
  delete(id: string): Promise<void>;
}
