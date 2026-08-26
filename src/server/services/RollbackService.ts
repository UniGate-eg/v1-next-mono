import { PrismaClient } from "@prisma/client";
import { RollbackStrategyFactory } from "./RollbackStrategyFactory";
import { RollbackExecutionResult } from "./rollback/IRollbackStrategy";
import { AdminCatalogService } from "./AdminCatalogService";

export class RollbackService {
  constructor(
    private prisma: PrismaClient,
    private catalogService: AdminCatalogService
  ) {}

  async validatePreflight(auditLogId: string): Promise<{ valid: boolean; error?: string; entityType?: string; entityId?: string }> {
    const log = await this.prisma.auditLog.findUnique({ where: { id: auditLogId } });
    if (!log) return { valid: false, error: "Audit log entry not found" };
    if (!log.beforeState) return { valid: false, error: "Audit log entry contains no beforeState snapshot to revert" };

    try {
      const strategy = RollbackStrategyFactory.forEntityType(log.entityType);
      const preflight = await this.prisma.$transaction(async (tx) => {
        return strategy.validatePreflight(tx, log.entityId, log.beforeState);
      });
      return { ...preflight, entityType: log.entityType, entityId: log.entityId };
    } catch (err) {
      return { valid: false, error: (err as Error).message };
    }
  }

  async execute(auditLogId: string, actorId: string, actorEmail: string): Promise<RollbackExecutionResult> {
    const log = await this.prisma.auditLog.findUnique({ where: { id: auditLogId } });
    if (!log) throw new Error("Audit log record not found");
    if (!log.beforeState) throw new Error("No beforeState snapshot available for rollback");

    const strategy = RollbackStrategyFactory.forEntityType(log.entityType);

    const result = await this.prisma.$transaction(async (tx) => {
      const preflight = await strategy.validatePreflight(tx, log.entityId, log.beforeState);
      if (!preflight.valid) {
        throw new Error(`Rollback preflight validation failed: ${preflight.error}`);
      }
      return strategy.executeRollback(tx, log.entityId, log.beforeState, actorId, actorEmail);
    }, {
      isolationLevel: "Serializable",
      timeout: 10000,
    });

    // Post-transaction cache invalidation and score recalculation
    if (log.universityId) {
      await this.catalogService.recalculateUniversityScore(log.universityId);
      await this.catalogService.invalidateUniversityCache(undefined, log.universityId);
    }

    return result;
  }
}
