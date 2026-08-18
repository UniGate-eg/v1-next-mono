import { AuditLogEntry, AuditLogDTO } from "../../../types/audit.types";

export interface IAuditLogRepository {
  create(entry: AuditLogEntry): Promise<void>;
  findMany(filters?: { universityId?: string, actorId?: string, entityType?: string }, page?: number, limit?: number): Promise<{ data: AuditLogDTO[], total: number }>;
}
