import { PostgresSuggestionRepository } from "../repositories/SuggestionRepository";
import { AuditLogRepository } from "../repositories/AuditLogRepository";
import { prisma } from "../../lib/prisma";
import { CreateSuggestionInput } from "../../schemas/suggestion.schema";
import { SuggestionDTO } from "../../types/audit.types";

const defaultSuggestionRepo = new PostgresSuggestionRepository(prisma);
const defaultAuditRepo = new AuditLogRepository(prisma);

export class SuggestionService {
  constructor(
    private suggestionRepo = defaultSuggestionRepo,
    private auditRepo = defaultAuditRepo
  ) {}

  async createSuggestion(data: CreateSuggestionInput): Promise<SuggestionDTO> {
    return SuggestionService.createSuggestion(data, this.suggestionRepo, this.auditRepo);
  }

  async reviewSuggestion(id: string, status: "MERGED" | "REJECTED", reviewerId: string, feedback?: string): Promise<SuggestionDTO> {
    return SuggestionService.reviewSuggestion(id, status, reviewerId, feedback, this.suggestionRepo, this.auditRepo);
  }

  static async createSuggestion(
    data: CreateSuggestionInput,
    suggestionRepo = defaultSuggestionRepo,
    auditRepo = defaultAuditRepo
  ): Promise<SuggestionDTO> {
    const suggestion = await suggestionRepo.create(data);
    
    await auditRepo.create({
      universityId: data.universityId,
      actorId: data.suggestedByEmail || "ANONYMOUS",
      action: "CREATE_SUGGESTION",
      entityType: "Suggestion",
      entityId: suggestion.id,
      afterState: data,
    });

    return suggestion;
  }

  static async reviewSuggestion(
    id: string, 
    status: "MERGED" | "REJECTED", 
    reviewerId: string, 
    feedback?: string,
    suggestionRepo = defaultSuggestionRepo,
    auditRepo = defaultAuditRepo
  ): Promise<SuggestionDTO> {
    const original = await suggestionRepo.findById(id);
    if (!original) throw new Error("Suggestion not found");

    const updated = await suggestionRepo.updateStatus(id, status, reviewerId, feedback);

    await auditRepo.create({
      universityId: (updated as any).universityId,
      actorId: reviewerId,
      action: status === "MERGED" ? "APPROVE_SUGGESTION" : "REJECT_SUGGESTION",
      entityType: "Suggestion",
      entityId: id,
      beforeState: original,
      afterState: updated,
    });

    return updated;
  }
}
