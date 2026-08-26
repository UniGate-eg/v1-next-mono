import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { UserContext, PermissionCode } from "../../types/rbac.types";
import { RoleMapper } from "../mappers/RoleMapper";

export class RbacService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Evaluates if a given user has a specific permission code and optional institution scope.
   * Leverages live database check.
   */
  async hasPermission(userId: string, code: PermissionCode, universityId?: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true }
    });

    if (!user || user.status === "SUSPENDED") {
      return false;
    }

    const now = new Date();
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        role: {
          permissions: {
            some: {
              permission: { code }
            }
          }
        }
      },
      include: {
        role: true,
        institutionAssignments: true,
      }
    });

    if (assignments.length === 0) {
      return false;
    }

    // If no specific universityId requested, permission exists
    if (!universityId) {
      return true;
    }

    // If checking scoped action, check if at least one matching role has global scope (empty institutions) or explicit match
    for (const assignment of assignments) {
      const institutions = assignment.institutionAssignments;
      // If assignment has no institution restrictions, it grants GLOBAL scope for that role
      if (institutions.length === 0) {
        return true;
      }
      if (institutions.some(i => i.universityId === universityId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Builds the complete UserContext from live database.
   */
  async buildUserContext(user: any): Promise<UserContext> {
    const now = new Date();
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: {
        userId: user.id,
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

    const permissions = new Set<PermissionCode>();
    const assignedUniversityIdsSet = new Set<string>();
    let hasGlobalRole = false;
    let minHierarchy = 1000;

    const roles = assignments.map(a => {
      const roleDTO = RoleMapper.toDTO(a.role);
      if (roleDTO.hierarchyLevel < minHierarchy) {
        minHierarchy = roleDTO.hierarchyLevel;
      }
      a.role.permissions.forEach(rp => {
        permissions.add(rp.permission.code as PermissionCode);
      });
      if (a.institutionAssignments.length === 0) {
        hasGlobalRole = true;
      } else {
        a.institutionAssignments.forEach(ia => assignedUniversityIdsSet.add(ia.universityId));
      }
      return roleDTO;
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status ?? "ACTIVE",
      roles,
      permissions,
      assignedUniversityIds: hasGlobalRole ? "GLOBAL" : Array.from(assignedUniversityIdsSet),
      hierarchyLevel: roles.length > 0 ? minHierarchy : 1000,
    };
  }
}

/**
 * React request memoized function to get full UserContext per request.
 */
export const getUserPermissionsCached = cache(async (prisma: PrismaClient, userId: string): Promise<UserContext | null> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const service = new RbacService(prisma);
  return service.buildUserContext(user);
});
