import type { University, UniversityFilters } from "@/schemas/university.schema";

export type UniversityWithMajors = University & {
  majors: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    universityId: string;
    duration: number;
    degree: string;
  }[];
};

export interface IUniversityRepository {
  findAll(filters: UniversityFilters): Promise<UniversityWithMajors[]>;
  findBySlug(slug: string): Promise<UniversityWithMajors | null>;
  findByIds(ids: string[]): Promise<UniversityWithMajors[]>;
  count(filters: UniversityFilters): Promise<number>;
  getFeatured(): Promise<UniversityWithMajors[]>;
}
