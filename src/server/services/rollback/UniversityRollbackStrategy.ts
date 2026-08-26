import { Prisma } from "@prisma/client";
import { IRollbackStrategy, RollbackExecutionResult } from "./IRollbackStrategy";

export class UniversityRollbackStrategy implements IRollbackStrategy {
  async validatePreflight(tx: Prisma.TransactionClient, entityId: string, beforeState: any): Promise<{ valid: boolean; error?: string }> {
    if (!beforeState || typeof beforeState !== "object") {
      return { valid: false, error: "Snapshot payload beforeState is empty or malformed" };
    }
    const current = await tx.university.findUnique({ where: { id: entityId } });
    if (!current) {
      return { valid: false, error: `University record ${entityId} has been completely deleted and cannot be restored via field update` };
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
    const current = await tx.university.findUnique({ where: { id: entityId } });
    
    // Whitelist only editable scalar fields
    const safeData: any = {};
    const scalarFields = [
      "nameEn", "nameAr", "shortName", "emoji", "educationModel", "type",
      "governorate", "city", "addressEn", "addressAr", "overviewEn", "overviewAr",
      "website", "logoUrl", "established", "qsRanking", "theRanking",
      "phones", "emails", "socialLinks", "strengthsEn", "strengthsAr", "publishStatus"
    ];

    for (const field of scalarFields) {
      if (beforeState[field] !== undefined) {
        safeData[field] = beforeState[field];
      }
    }

    const updated = await tx.university.update({
      where: { id: entityId },
      data: safeData
    });

    await tx.auditLog.create({
      data: {
        actorId,
        actorEmail,
        action: "ROLLBACK",
        entityType: "UNIVERSITY",
        entityId,
        universityId: entityId,
        beforeState: current as any,
        afterState: updated as any,
      }
    });

    return {
      success: true,
      entityType: "UNIVERSITY",
      entityId,
      details: `Reverted University [${updated.nameEn}] to historical snapshot`
    };
  }
}
