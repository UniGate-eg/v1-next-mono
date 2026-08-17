"use server";

import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import { AdminUniversityService } from "../../../server/services/AdminUniversityService";
import { 
  CreateUniversitySchema, 
  UpdateUniversitySchema, 
  CreateUniversityInput, 
  UpdateUniversityInput 
} from "../../../schemas/university.schema";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  // Note: Depending on how roles are loaded in Better Auth, you might check session.user.role
  const user = session.user as any;
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && user.role !== "EDITOR") {
    throw new Error("Forbidden: Requires Editor or Admin privileges");
  }
  
  return user;
}

export async function createUniversityAction(data: CreateUniversityInput) {
  try {
    const user = await requireAdmin();
    const validated = CreateUniversitySchema.parse(data);
    const university = await AdminUniversityService.createUniversity(user.id, validated);
    return { success: true, data: university };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: (error as Error).message };
  }
}

export async function updateUniversityAction(id: string, data: UpdateUniversityInput) {
  try {
    const user = await requireAdmin();
    const validated = UpdateUniversitySchema.parse(data);
    const university = await AdminUniversityService.updateUniversity(user.id, id, validated);
    return { success: true, data: university };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: (error as Error).message };
  }
}

export async function archiveUniversityAction(id: string) {
  try {
    const user = await requireAdmin();
    await AdminUniversityService.archiveUniversity(user.id, id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
