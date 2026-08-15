"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SuggestionRepository } from "@/server/repositories/SuggestionRepository";
import { SuggestionService } from "@/server/services/SuggestionService";

const suggestionRepository = new SuggestionRepository();
const suggestionService = new SuggestionService(suggestionRepository);

export async function submitSuggestionAction(rawInput: unknown) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Please sign in to submit university data suggestions or corrections.",
      } as const;
    }

    const suggestion = await suggestionService.submitSuggestion(
      session.user.id,
      rawInput
    );
    return { success: true, data: suggestion } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}
