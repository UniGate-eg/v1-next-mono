"use server";

import { withAdminAuth } from "../../../server/actions/withAdminAuth";
import { AdminUniversityService } from "../../../server/services/AdminUniversityService";
import { adminCatalogService } from "../../../lib/di";
import { 
  CreateUniversitySchema, 
  UpdateUniversitySchema, 
  CreateUniversityInput, 
  UpdateUniversityInput 
} from "../../../schemas/university.schema";
import { revalidatePath } from "next/cache";

export const createUniversityAction = withAdminAuth(
  "universities:create_delete",
  async (ctx, data: CreateUniversityInput) => {
    const validated = CreateUniversitySchema.parse(data);
    const university = await AdminUniversityService.createUniversity(ctx.id, validated);
    await adminCatalogService.recalculateUniversityScore(university.id);
    await adminCatalogService.invalidateUniversityCache(university.slug, university.id);
    return university;
  }
);

export const updateUniversityAction = withAdminAuth(
  "universities:edit_scoped",
  async (ctx, { id, data }: { id: string; data: UpdateUniversityInput }) => {
    const validated = UpdateUniversitySchema.parse(data);
    const university = await AdminUniversityService.updateUniversity(ctx.id, id, validated);
    await adminCatalogService.recalculateUniversityScore(id);
    await adminCatalogService.invalidateUniversityCache(university.slug, id);
    return university;
  },
  { universityIdExtractor: (input) => input.id }
);

export const archiveUniversityAction = withAdminAuth(
  "universities:create_delete",
  async (ctx, id: string) => {
    await AdminUniversityService.archiveUniversity(ctx.id, id);
    await adminCatalogService.invalidateUniversityCache(undefined, id);
    return { success: true };
  }
);
