import { suggestionRepository, auditLogRepository } from "../../lib/di";
import { CreateSuggestionInput } from "../../schemas/suggestion.schema";
import { SuggestionDTO } from "../../types/audit.types";

export class SuggestionService {
  static async createSuggestion(data: CreateSuggestionInput): Promise<SuggestionDTO> {
    const suggestion = await suggestionRepository.create(data);
    
    // We log the suggestion creation, but since it's anonymous/public, actorId is system or the user's email
    await auditLogRepository.create({
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
    feedback?: string
  ): Promise<SuggestionDTO> {
    const original = await suggestionRepository.findById(id);
    if (!original) throw new Error("Suggestion not found");

    const updated = await suggestionRepository.updateStatus(id, status, reviewerId, feedback);

    await auditLogRepository.create({
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
