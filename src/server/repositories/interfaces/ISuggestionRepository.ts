import type { CreateSuggestionInput } from "@/schemas/suggestion.schema";
import type { SuggestionDTO } from "@/types/audit.types";

export interface ISuggestionRepository {
  create(data: CreateSuggestionInput): Promise<SuggestionDTO>;
  findPending(page?: number, limit?: number): Promise<{ data: SuggestionDTO[]; total: number }>;
  findById(id: string): Promise<SuggestionDTO | null>;
  updateStatus(id: string, status: "MERGED" | "REJECTED", reviewerId: string, feedback?: string): Promise<SuggestionDTO>;
}
