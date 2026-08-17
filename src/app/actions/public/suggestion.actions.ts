"use server";

import { SuggestionService } from "../../../server/services/SuggestionService";
import { CreateSuggestionSchema, CreateSuggestionInput } from "../../../schemas/suggestion.schema";
import { z } from "zod";

export async function submitSuggestionAction(data: CreateSuggestionInput) {
  try {
    const validated = CreateSuggestionSchema.parse(data);
    const suggestion = await SuggestionService.createSuggestion(validated);
    return { success: true, data: suggestion };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: (error as Error).message };
  }
}
