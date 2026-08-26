import { PrismaClient } from "@prisma/client";
import { IUserRoleAssignmentRepository, RoleAssignmentRecord } from "./interfaces/IUserRoleAssignmentRepository";
import { PermissionCode } from "../../types/rbac.types";

export class PostgresUserRoleAssignmentRepository implements IUserRoleAssignmentRepository {
  constructor(private prisma: PrismaClient) {}

  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    universityIds: string[] = [],
    expiresAt: Date | null = null
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Upsert assignment
      const assignment = await tx.userRoleAssignment.upsert({
        where: { userId_roleId: { userId, roleId } },
        create: {
          userId,
          roleId,
          assignedBy,
          expiresAt,
        },
        update: {
          assignedBy,
          expiresAt,
          assignedAt: new Date(),
        }
      });

      // Clear existing institution assignments and re-create if specified
      await tx.institutionAssignment.deleteMany({
        where: { userRoleAssignmentId: assignment.id }
      });

      if (universityIds.length > 0) {
        await tx.institutionAssignment.createMany({
          data: universityIds.map(universityId => ({
            userRoleAssignmentId: assignment.id,
            universityId,
          }))
        });
      }
    });
  }

  async revokeRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRoleAssignment.deleteMany({
      where: { userId, roleId }
    });
  }

  async findAssignmentsForUser(userId: string): Promise<RoleAssignmentRecord[]> {
    const now = new Date();
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        },
        institutionAssignments: true,
      }
    });

    return assignments as any;
  }

  async findUsersWithPermission(permissionCode: PermissionCode): Promise<string[]> {
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: {
        role: {
          permissions: {
            some: {
              permission: { code: permissionCode }
            }
          }
        },
        user: { status: "ACTIVE" }
      },
      select: { userId: true }
    });

    return Array.from(new Set(assignments.map(a => a.userId)));
  }
}
