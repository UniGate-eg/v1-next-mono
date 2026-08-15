import { z } from "zod";

export const SuggestionTypeSchema = z.enum([
  "DATA_CORRECTION",
  "MISSING_INFO",
  "NEW_UNIVERSITY",
  "GENERAL",
]);

export const SuggestionStatusSchema = z.enum([
  "PENDING",
  "REVIEWED",
  "RESOLVED",
]);

export const CreateSuggestionSchema = z.object({
  content: z.string().min(5, "Suggestion must be at least 5 characters").max(2000),
  type: SuggestionTypeSchema.default("DATA_CORRECTION"),
});

export type SuggestionType = z.infer<typeof SuggestionTypeSchema>;
export type SuggestionStatus = z.infer<typeof SuggestionStatusSchema>;
export type CreateSuggestionInput = z.infer<typeof CreateSuggestionSchema>;
