"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SuggestionService } from "@/server/services/SuggestionService";
import { CreateSuggestionSchema } from "@/schemas/suggestion.schema";

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

    const data = CreateSuggestionSchema.parse(rawInput);
    const inputWithUser = { ...data, suggestedByEmail: session.user.email || "ANONYMOUS" };
    
    const suggestion = await SuggestionService.createSuggestion(inputWithUser as any);
    return { success: true, data: suggestion } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}
