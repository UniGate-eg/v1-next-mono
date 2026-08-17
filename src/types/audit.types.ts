export interface AuditLogDTO {
  id: string;
  universityId: string | null;
  actorId: string;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeState: any | null;
  afterState: any | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface AuditLogEntry {
  universityId?: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
}

export interface SuggestionDTO {
  id: string;
  userId?: string | null;
  universityId: string;
  suggestedField: string;
  suggestedValue: string;
  sourceUrl?: string | null;
  notes?: string | null;
  status: "PENDING" | "MERGED" | "REJECTED";
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  university?: {
    nameEn: string;
  } | null;
}
