"use server";

import { UniversityRepository } from "@/server/repositories/UniversityRepository";
import { UniversityService } from "@/server/services/UniversityService";
import { UniversityFiltersSchema } from "@/schemas/university.schema";

const universityRepository = new UniversityRepository();
const universityService = new UniversityService(universityRepository);

export async function getUniversitiesAction(rawFilters: unknown = {}) {
  try {
    const filters = UniversityFiltersSchema.parse(rawFilters);
    const result = await universityService.getUniversities(filters);
    return { success: true, data: result } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}

export async function getUniversityBySlugAction(slug: string) {
  try {
    const university = await universityService.getUniversityBySlug(slug);
    return { success: true, data: university } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}

export async function getUniversitiesByIdsAction(ids: string[]) {
  try {
    const universities = await universityService.getUniversitiesByIds(ids);
    return { success: true, data: universities } as const;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: "An unexpected error occurred." } as const;
  }
}
