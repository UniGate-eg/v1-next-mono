import { PermissionDTO } from "../../../types/role.types";

export interface IPermissionRepository {
  findAll(): Promise<PermissionDTO[]>;
  findByCode(code: string): Promise<PermissionDTO | null>;
  findByCodes(codes: string[]): Promise<PermissionDTO[]>;
  findByDomain(domain: string): Promise<PermissionDTO[]>;
}
