import { PrismaClient, Prisma } from "@prisma/client";

export interface RollbackExecutionResult {
  success: boolean;
  entityType: string;
  entityId: string;
  details: string;
}

export interface IRollbackStrategy {
  validatePreflight(tx: Prisma.TransactionClient, entityId: string, beforeState: any): Promise<{ valid: boolean; error?: string }>;
  executeRollback(tx: Prisma.TransactionClient, entityId: string, beforeState: any, actorId: string, actorEmail: string): Promise<RollbackExecutionResult>;
}
