import { describe, it, expect, vi } from "vitest";
import { UniversityService } from "@/server/services/UniversityService";
import type { IUniversityRepository, UniversityWithMajors } from "@/server/repositories/interfaces/IUniversityRepository";

const mockUniversities: UniversityWithMajors[] = [
  {
    id: "clx123",
    slug: "cairo-university",
    nameAr: "جامعة القاهرة",
    nameEn: "Cairo University",
    type: "PUBLIC",
    governorate: "Giza",
    website: "https://cu.edu.eg",
    logoUrl: null,
    description: "Premier Egyptian Public University",
    established: 1908,
    majors: [
      {
        id: "m1",
        slug: "engineering",
        nameAr: "هندسة",
        nameEn: "Engineering",
        universityId: "clx123",
        duration: 5,
        degree: "B.Sc.",
      },
    ],
  },
];

const mockRepo: IUniversityRepository = {
  findAll: vi.fn().mockResolvedValue(mockUniversities),
  findBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === "cairo-university") return mockUniversities[0];
    return null;
  }),
  findByIds: vi.fn().mockResolvedValue(mockUniversities),
  count: vi.fn().mockResolvedValue(1),
  getFeatured: vi.fn().mockResolvedValue(mockUniversities),
};

describe("UniversityService", () => {
  const service = new UniversityService(mockRepo);

  it("should return paginated universities with metadata", async () => {
    const result = await service.getUniversities({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.total).toBe(1);
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  it("should retrieve university by slug", async () => {
    const university = await service.getUniversityBySlug("cairo-university");
    expect(university.nameEn).toBe("Cairo University");
    expect(university.majors).toHaveLength(1);
  });

  it("should throw an error when university slug is not found", async () => {
    await expect(service.getUniversityBySlug("non-existent")).rejects.toThrow(
      "University not found"
    );
  });
});
