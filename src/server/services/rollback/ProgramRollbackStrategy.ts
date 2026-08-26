import { Prisma } from "@prisma/client";
import { IRollbackStrategy, RollbackExecutionResult } from "./IRollbackStrategy";

export class ProgramRollbackStrategy implements IRollbackStrategy {
  async validatePreflight(tx: Prisma.TransactionClient, entityId: string, beforeState: any): Promise<{ valid: boolean; error?: string }> {
    if (!beforeState) return { valid: false, error: "beforeState snapshot missing" };
    if (beforeState.universityId) {
      const univ = await tx.university.findUnique({ where: { id: beforeState.universityId } });
      if (!univ) return { valid: false, error: `Parent university ${beforeState.universityId} does not exist.` };
    }
    if (beforeState.facultyId) {
      const faculty = await tx.faculty.findUnique({ where: { id: beforeState.facultyId } });
      if (!faculty) return { valid: false, error: `Parent faculty ${beforeState.facultyId} does not exist.` };
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
    const current = await tx.degreeProgram.findUnique({ where: { id: entityId } });
    const safeData: any = {};
    const scalarFields = [
      "nameEn", "nameAr", "degreeType", "durationYears", "studyLanguage",
      "tuitionEgpPerYear", "tuitionUsdPerYear", "careerOpportunities", "dualDegreePartner"
    ];

    for (const field of scalarFields) {
      if (beforeState[field] !== undefined) safeData[field] = beforeState[field];
    }

    const updated = await tx.degreeProgram.update({
      where: { id: entityId },
      data: safeData
    });

    await tx.auditLog.create({
      data: {
        actorId,
        actorEmail,
        action: "ROLLBACK",
        entityType: "DEGREE_PROGRAM",
        entityId,
        universityId: updated.universityId,
        beforeState: current as any,
        afterState: updated as any,
      }
    });

    return {
      success: true,
      entityType: "DEGREE_PROGRAM",
      entityId,
      details: `Reverted Degree Program [${updated.nameEn}]`
    };
  }
}
