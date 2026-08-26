import { PrismaClient, Prisma } from "@prisma/client";
import { IUserRepository } from "./interfaces/IUserRepository";
import { UserDTO, AdminUserDTO, UserFilters, UserStatus } from "../../types/user.types";
import { UserMapper } from "../mappers/UserMapper";

export class PostgresUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserDTO | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDTO(user) : null;
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserMapper.toDTO(user) : null;
  }

  async findAdminUserById(id: string): Promise<AdminUserDTO | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roleAssignments: {
          include: {
            role: true,
            institutionAssignments: {
              include: {
                university: {
                  select: { id: true, nameEn: true, nameAr: true, slug: true }
                }
              }
            }
          }
        }
      }
    });

    return user ? UserMapper.toAdminDTO(user) : null;
  }

  async findMany(filters?: UserFilters, page = 1, limit = 20): Promise<{ data: AdminUserDTO[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ]
      }),
      ...(filters?.roleKey && {
        roleAssignments: {
          some: {
            role: { key: filters.roleKey }
          }
        }
      }),
      ...(filters?.universityId && {
        roleAssignments: {
          some: {
            institutionAssignments: {
              some: { universityId: filters.universityId }
            }
          }
        }
      }),
    };

    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          roleAssignments: {
            include: {
              role: true,
              institutionAssignments: {
                include: {
                  university: {
                    select: { id: true, nameEn: true, nameAr: true, slug: true }
                  }
                }
              }
            }
          }
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data: users.map(UserMapper.toAdminDTO),
      total,
    };
  }

  async countActiveSuperAdmins(): Promise<number> {
    return this.prisma.userRoleAssignment.count({
      where: {
        role: { key: "SUPER_ADMIN" },
        user: { status: "ACTIVE" }
      }
    });
  }

  async updateStatus(id: string, status: UserStatus): Promise<UserDTO> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: status as any }
    });
    return UserMapper.toDTO(user);
  }

  async updateRole(id: string, role: string): Promise<UserDTO> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: role as any }
    });
    return UserMapper.toDTO(user);
  }
}
