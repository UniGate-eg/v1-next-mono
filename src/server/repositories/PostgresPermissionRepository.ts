import { PrismaClient } from "@prisma/client";
import { IPermissionRepository } from "./interfaces/IPermissionRepository";
import { PermissionDTO } from "../../types/role.types";
import { RoleMapper } from "../mappers/RoleMapper";

export class PostgresPermissionRepository implements IPermissionRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<PermissionDTO[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ domain: "asc" }, { action: "asc" }]
    });
    return permissions.map(RoleMapper.toPermissionDTO);
  }

  async findByCode(code: string): Promise<PermissionDTO | null> {
    const permission = await this.prisma.permission.findUnique({ where: { code } });
    return permission ? RoleMapper.toPermissionDTO(permission) : null;
  }

  async findByCodes(codes: string[]): Promise<PermissionDTO[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: codes } }
    });
    return permissions.map(RoleMapper.toPermissionDTO);
  }

  async findByDomain(domain: string): Promise<PermissionDTO[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { domain },
      orderBy: { action: "asc" }
    });
    return permissions.map(RoleMapper.toPermissionDTO);
  }
}
