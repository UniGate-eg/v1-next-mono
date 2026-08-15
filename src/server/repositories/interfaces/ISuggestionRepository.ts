import type { SuggestionType, SuggestionStatus } from "@/schemas/suggestion.schema";

export type SuggestionRecord = {
  id: string;
  userId: string;
  content: string;
  type: SuggestionType;
  status: SuggestionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export interface ISuggestionRepository {
  create(userId: string, content: string, type: SuggestionType): Promise<SuggestionRecord>;
  findByUser(userId: string): Promise<SuggestionRecord[]>;
}
