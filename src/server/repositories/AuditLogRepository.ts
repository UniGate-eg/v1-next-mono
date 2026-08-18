import { IAuditLogRepository } from "./interfaces/IAuditLogRepository";
import { AuditLogEntry, AuditLogDTO } from "../../types/audit.types";
import { PrismaClient, Prisma } from "@prisma/client";

export class AuditLogRepository implements IAuditLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(entry: AuditLogEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        universityId: entry.universityId,
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        beforeState: entry.beforeState || Prisma.JsonNull,
        afterState: entry.afterState || Prisma.JsonNull,
        ipAddress: entry.ipAddress
      }
    });
  }

  async findMany(
    filters?: { universityId?: string, actorId?: string, entityType?: string }, 
    page = 1, 
    limit = 20
  ): Promise<{ data: AuditLogDTO[], total: number }> {
    const where: Prisma.AuditLogWhereInput = {
      ...(filters?.universityId && { universityId: filters.universityId }),
      ...(filters?.actorId && { actorId: filters.actorId }),
      ...(filters?.entityType && { entityType: filters.entityType })
    };

    const skip = (page - 1) * limit;

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.auditLog.count({ where })
    ]);

    return {
      data: logs.map(log => ({
        id: log.id,
        universityId: log.universityId,
        actorId: log.actorId,
        actorEmail: log.actorEmail,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        beforeState: log.beforeState,
        afterState: log.afterState,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt
      })),
      total
    };
  }
}
