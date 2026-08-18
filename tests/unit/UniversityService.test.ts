import { describe, it, expect, vi } from "vitest";
import { UniversityService } from "@/server/services/UniversityService";
import type { IUniversityReader } from "@/server/repositories/interfaces/IUniversityRepository";
import type { UniversityDTO } from "@/types/university.types";

const mockUniversities: UniversityDTO[] = [
  {
    id: "clx123",
    slug: "cairo-university",
    shortName: "CU",
    emoji: "🏛️",
    nameAr: "جامعة القاهرة",
    nameEn: "Cairo University",
    educationModel: "EGYPTIAN",
    type: "PUBLIC",
    governorate: "Giza",
    city: "Giza",
    addressEn: null,
    addressAr: null,
    overviewEn: "Premier Egyptian Public University",
    overviewAr: "جامعة حكومية رائدة",
    website: "https://cu.edu.eg",
    logoUrl: null,
    established: 1908,
    qsRanking: null,
    theRanking: null,
    phones: [],
    emails: [],
    socialLinks: null,
    strengthsEn: [],
    strengthsAr: [],
    publishStatus: "PUBLISHED",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockRepo: IUniversityReader = {
  findMany: vi.fn().mockResolvedValue({ data: mockUniversities, total: 1 }),
  findBySlug: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === "cairo-university") return mockUniversities[0];
    return null;
  }),
  findById: vi.fn().mockImplementation(async (id: string) => {
    if (id === "clx123") return mockUniversities[0];
    return null;
  }),
  findForSearch: vi.fn().mockResolvedValue([]),
};

describe("UniversityService", () => {
  const service = new UniversityService(mockRepo);

  it("should return paginated universities with metadata", async () => {
    const result = await service.getUniversities({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.total).toBe(1);
    expect(mockRepo.findMany).toHaveBeenCalled();
  });

  it("should retrieve university by slug", async () => {
    const university = await service.getUniversityBySlug("cairo-university");
    expect(university.nameEn).toBe("Cairo University");
  });

  it("should throw an error when university slug is not found", async () => {
    await expect(service.getUniversityBySlug("non-existent")).rejects.toThrow(
      "University not found"
    );
  });
});
