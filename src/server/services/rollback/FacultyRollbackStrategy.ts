import { Prisma } from "@prisma/client";
import { IRollbackStrategy, RollbackExecutionResult } from "./IRollbackStrategy";

export class FacultyRollbackStrategy implements IRollbackStrategy {
  async validatePreflight(tx: Prisma.TransactionClient, entityId: string, beforeState: any): Promise<{ valid: boolean; error?: string }> {
    if (!beforeState) return { valid: false, error: "beforeState snapshot missing" };
    if (beforeState.universityId) {
      const parentUniv = await tx.university.findUnique({ where: { id: beforeState.universityId } });
      if (!parentUniv) {
        return { valid: false, error: `Parent university ${beforeState.universityId} no longer exists. Foreign key constraint violated.` };
      }
    }
    return { valid: true };
  }

  async executeRollback(
    tx: Prisma.TransactionClient,
    entityId: string,
    beforeState: any,
    actorId: string,
    actorEmail: string
  ): Promise<RollbackExecutionResult> {
    const current = await tx.faculty.findUnique({ where: { id: entityId } });
    const safeData: any = {};
    const scalarFields = ["nameEn", "nameAr", "descriptionEn", "descriptionAr", "deanName", "departments"];

    for (const field of scalarFields) {
      if (beforeState[field] !== undefined) safeData[field] = beforeState[field];
    }

    const updated = await tx.faculty.update({
      where: { id: entityId },
      data: safeData
    });

    await tx.auditLog.create({
      data: {
        actorId,
        actorEmail,
        action: "ROLLBACK",
        entityType: "FACULTY",
        entityId,
        universityId: updated.universityId,
        beforeState: current as any,
        afterState: updated as any,
      }
    });

    return {
      success: true,
      entityType: "FACULTY",
      entityId,
      details: `Reverted Faculty [${updated.nameEn}]`
    };
  }
}
