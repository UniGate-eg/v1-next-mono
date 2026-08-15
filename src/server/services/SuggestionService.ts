import type { ISuggestionRepository, SuggestionRecord } from "@/server/repositories/interfaces/ISuggestionRepository";
import { CreateSuggestionSchema } from "@/schemas/suggestion.schema";

export class SuggestionService {
  constructor(private readonly suggestionRepo: ISuggestionRepository) {}

  async submitSuggestion(
    userId: string,
    rawInput: unknown
  ): Promise<SuggestionRecord> {
    if (!userId) throw new Error("User ID is required to submit a suggestion");
    const input = CreateSuggestionSchema.parse(rawInput);
    return this.suggestionRepo.create(userId, input.content, input.type);
  }

  async getUserSuggestions(userId: string): Promise<SuggestionRecord[]> {
    if (!userId) throw new Error("User ID is required");
    return this.suggestionRepo.findByUser(userId);
  }
}
