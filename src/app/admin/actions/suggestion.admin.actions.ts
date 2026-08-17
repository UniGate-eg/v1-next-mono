"use server";

import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import { SuggestionService } from "../../../server/services/SuggestionService";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "EDITOR") {
    throw new Error("Forbidden: Requires Editor or Admin privileges");
  }
  
  return user;
}

export async function reviewSuggestionAction(id: string, status: "MERGED" | "REJECTED", feedback?: string) {
  try {
    const user = await requireAdmin();
    const suggestion = await SuggestionService.reviewSuggestion(id, status, user.id, feedback);
    return { success: true, data: suggestion };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
