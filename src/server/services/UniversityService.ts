import type { IUniversityReader } from "@/server/repositories/interfaces/IUniversityRepository";
import type { UniversityDTO } from "@/types/university.types";
import { UniversityFiltersSchema } from "@/schemas/university.schema";

export class UniversityService {
  constructor(private readonly universityRepo: IUniversityReader) {}

  async getUniversities(rawFilters: unknown = {}) {
    const filters = UniversityFiltersSchema.parse(rawFilters);

    const { data: universities, total } = await this.universityRepo.findMany(
      filters,
      filters.page,
      filters.limit
    );

    return {
      data: universities,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit) || 1,
      },
    };
  }

  async getUniversityBySlug(slug: string): Promise<UniversityDTO> {
    if (!slug) throw new Error("University slug is required");
    const university = await this.universityRepo.findBySlug(slug);
    if (!university) throw new Error(`University not found: ${slug}`);
    return university;
  }

  async getUniversitiesByIds(ids: string[]): Promise<UniversityDTO[]> {
    if (!ids || ids.length === 0) return [];
    const results = await Promise.all(ids.map((id) => this.universityRepo.findById(id)));
    return results.filter((u): u is UniversityDTO => u !== null);
  }

  async getFeaturedUniversities(): Promise<UniversityDTO[]> {
    const { data } = await this.universityRepo.findMany(undefined, 1, 6);
    return data;
  }
}
