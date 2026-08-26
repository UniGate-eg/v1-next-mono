import { PrismaClient } from "@prisma/client";
import { IRoleRepository } from "./interfaces/IRoleRepository";
import { RoleWithPermissionsDTO } from "../../types/role.types";
import { CreateRoleInput, UpdateRoleInput } from "../../schemas/role.schema";
import { RoleMapper } from "../mappers/RoleMapper";

export class PostgresRoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<RoleWithPermissionsDTO | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userAssignments: true } }
      }
    });
    return role ? RoleMapper.toRoleWithPermissionsDTO(role) : null;
  }

  async findByKey(key: string): Promise<RoleWithPermissionsDTO | null> {
    const role = await this.prisma.role.findUnique({
      where: { key },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userAssignments: true } }
      }
    });
    return role ? RoleMapper.toRoleWithPermissionsDTO(role) : null;
  }

  async findAll(): Promise<RoleWithPermissionsDTO[]> {
    const roles = await this.prisma.role.findMany({
      orderBy: { hierarchyLevel: "asc" },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userAssignments: true } }
      }
    });
    return roles.map(RoleMapper.toRoleWithPermissionsDTO);
  }

  async create(data: CreateRoleInput): Promise<RoleWithPermissionsDTO> {
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: data.permissionCodes } }
    });

    const role = await this.prisma.role.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        hierarchyLevel: data.hierarchyLevel,
        isSystemDefault: false,
        permissions: {
          create: permissions.map(p => ({ permissionId: p.id }))
        }
      },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userAssignments: true } }
      }
    });

    return RoleMapper.toRoleWithPermissionsDTO(role);
  }

  async update(id: string, data: UpdateRoleInput): Promise<RoleWithPermissionsDTO> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.hierarchyLevel !== undefined) updateData.hierarchyLevel = data.hierarchyLevel;

    if (data.permissionCodes !== undefined) {
      const permissions = await this.prisma.permission.findMany({
        where: { code: { in: data.permissionCodes } }
      });
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      updateData.permissions = {
        create: permissions.map(p => ({ permissionId: p.id }))
      };
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userAssignments: true } }
      }
    });

    return RoleMapper.toRoleWithPermissionsDTO(role);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }
}
