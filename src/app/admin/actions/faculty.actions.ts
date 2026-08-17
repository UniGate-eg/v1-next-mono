"use server";

import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import { AdminFacultyService } from "../../../server/services/AdminFacultyService";
import { 
  CreateFacultySchema, 
  UpdateFacultySchema, 
  CreateFacultyInput, 
  UpdateFacultyInput 
} from "../../../schemas/faculty.schema";
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

export async function createFacultyAction(data: CreateFacultyInput) {
  try {
    const user = await requireAdmin();
    const validated = CreateFacultySchema.parse(data);
    const faculty = await AdminFacultyService.createFaculty(user.id, validated);
    return { success: true, data: faculty };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: (error as Error).message };
  }
}

export async function updateFacultyAction(id: string, data: UpdateFacultyInput) {
  try {
    const user = await requireAdmin();
    const validated = UpdateFacultySchema.parse(data);
    const faculty = await AdminFacultyService.updateFaculty(user.id, id, validated);
    return { success: true, data: faculty };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors };
    }
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteFacultyAction(id: string) {
  try {
    const user = await requireAdmin();
    await AdminFacultyService.deleteFaculty(user.id, id);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
