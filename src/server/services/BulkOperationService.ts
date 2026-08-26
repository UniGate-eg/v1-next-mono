import { PrismaClient, PublishStatus } from "@prisma/client";
import { UserContext } from "../../types/rbac.types";
import { AdminCatalogService } from "./AdminCatalogService";

export interface BulkOperationResult {
  succeeded: string[];
  failed: string[];
  total: number;
}

export class BulkOperationService {
  constructor(
    private prisma: PrismaClient,
    private catalogService: AdminCatalogService
  ) {}

  async bulkUpdateStatus(
    universityIds: string[],
    status: PublishStatus,
    ctx: UserContext
  ): Promise<BulkOperationResult> {
    const succeeded: string[] = [];
    const failed: string[] = [];

    // Scope check: If user is scoped to specific universities, filter allowed IDs
    let allowedIds = universityIds;
    if (ctx.assignedUniversityIds !== "GLOBAL") {
      const assignedSet = new Set(ctx.assignedUniversityIds);
      allowedIds = universityIds.filter(id => assignedSet.has(id));
      const deniedIds = universityIds.filter(id => !assignedSet.has(id));
      failed.push(...deniedIds);
    }

    if (allowedIds.length === 0) {
      return { succeeded, failed, total: universityIds.length };
    }

    // Chunk in batches of 50 to maintain fast transactional performance
    const chunkSize = 50;
    for (let i = 0; i < allowedIds.length; i += chunkSize) {
      const chunk = allowedIds.slice(i, i + chunkSize);
      try {
        await this.prisma.$transaction(async (tx) => {
          const currentRecords = await tx.university.findMany({
            where: { id: { in: chunk } }
          });

          await tx.university.updateMany({
            where: { id: { in: chunk } },
            data: { publishStatus: status }
          });

          const auditLogs = currentRecords.map(u => ({
            actorId: ctx.id,
            actorEmail: ctx.email,
            action: status === "PUBLISHED" ? "BULK_PUBLISH" : "BULK_ARCHIVE",
            entityType: "UNIVERSITY",
            entityId: u.id,
            universityId: u.id,
            beforeState: { publishStatus: u.publishStatus },
            afterState: { publishStatus: status },
          }));

          await tx.auditLog.createMany({ data: auditLogs });
        });

        succeeded.push(...chunk);
      } catch (err) {
        console.error("Bulk update chunk error:", err);
        failed.push(...chunk);
      }
    }

    // Invalidate public catalog cache
    await this.catalogService.invalidateUniversityCache();

    return {
      succeeded,
      failed,
      total: universityIds.length,
    };
  }
}
