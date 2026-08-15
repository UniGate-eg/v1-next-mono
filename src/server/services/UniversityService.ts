import type { IUniversityRepository, UniversityWithMajors } from "@/server/repositories/interfaces/IUniversityRepository";
import { UniversityFiltersSchema, type UniversityFilters } from "@/schemas/university.schema";

export class UniversityService {
  constructor(private readonly universityRepo: IUniversityRepository) {}

  async getUniversities(rawFilters: unknown = {}) {
    const filters = UniversityFiltersSchema.parse(rawFilters);

    const [universities, total] = await Promise.all([
      this.universityRepo.findAll(filters),
      this.universityRepo.count(filters),
    ]);

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

  async getUniversityBySlug(slug: string): Promise<UniversityWithMajors> {
    if (!slug) throw new Error("University slug is required");
    const university = await this.universityRepo.findBySlug(slug);
    if (!university) throw new Error(`University not found: ${slug}`);
    return university;
  }

  async getUniversitiesByIds(ids: string[]): Promise<UniversityWithMajors[]> {
    if (!ids || ids.length === 0) return [];
    return this.universityRepo.findByIds(ids);
  }

  async getFeaturedUniversities(): Promise<UniversityWithMajors[]> {
    return this.universityRepo.getFeatured();
  }
}
