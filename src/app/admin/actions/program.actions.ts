"use server";

import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import { AdminProgramService } from "../../../server/services/AdminProgramService";
import { 
  CreateDegreeProgramSchema, 
  UpdateDegreeProgramSchema, 
  CreateDegreeProgramInput, 
  UpdateDegreeProgramInput 
} from "../../../schemas/program.schema";
import { z } from "zod";

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

export async function createProgramAction(data: CreateDegreeProgramInput) {
  try {
    const user = await requireAdmin();
    const validated = CreateDegreeProgramSchema.parse(data);
    const program = await AdminProgramService.createProgram(user.id, validated);
    return { success: true, data: program };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: (error as Error).message };
  }
}

export async function updateProgramAction(id: string, data: UpdateDegreeProgramInput) {
  try {
    const user = await requireAdmin();
    const validated = UpdateDegreeProgramSchema.parse(data);
    const program = await AdminProgramService.updateProgram(user.id, id, validated);
    return { success: true, data: program };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteProgramAction(id: string) {
  try {
    const user = await requireAdmin();
    await AdminProgramService.deleteProgram(user.id, id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
