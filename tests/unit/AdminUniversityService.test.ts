import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminUniversityService } from "@/server/services/AdminUniversityService";
import { universityRepository, auditLogRepository } from "@/lib/di";
import { CacheInvalidator } from "@/lib/cache-invalidator";

vi.mock("@/lib/di", () => ({
  universityRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
  },
  auditLogRepository: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/cache-invalidator", () => ({
  CacheInvalidator: {
    invalidateGlobalLists: vi.fn(),
    invalidateUniversity: vi.fn(),
  },
}));

describe("AdminUniversityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create university, log audit entry, and invalidate global cache lists", async () => {
    const input = {
      slug: "new-uni",
      nameEn: "New University",
      nameAr: "جامعة جديدة",
      emoji: "🏛️",
      educationModel: "BRITISH" as const,
      type: "PRIVATE" as const,
      governorate: "Giza",
      publishStatus: "PUBLISHED" as const,
      phones: [],
      emails: [],
      strengthsEn: [],
      strengthsAr: [],
    };

    const createdUni = { id: "uni-new", ...input, createdAt: new Date(), updatedAt: new Date() };
    vi.mocked(universityRepository.create).mockResolvedValue(createdUni as any);

    const result = await AdminUniversityService.createUniversity("admin-1", input);

    expect(result.id).toBe("uni-new");
    expect(universityRepository.create).toHaveBeenCalledWith(input);
    expect(auditLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "admin-1",
        action: "CREATE_UNIVERSITY",
        entityId: "uni-new",
      })
    );
    expect(CacheInvalidator.invalidateGlobalLists).toHaveBeenCalled();
  });

  it("should update university, log audit trail, and invalidate specific cache", async () => {
    const existing = {
      id: "uni-1",
      slug: "cairo-uni",
      nameEn: "Cairo University",
      publishStatus: "PUBLISHED",
    };

    const updateData = {
      id: "uni-1",
      nameEn: "Cairo University Updated",
    };

    const updated = { ...existing, ...updateData };

    vi.mocked(universityRepository.findById).mockResolvedValue(existing as any);
    vi.mocked(universityRepository.update).mockResolvedValue(updated as any);

    const result = await AdminUniversityService.updateUniversity("admin-1", "uni-1", updateData);

    expect(result.nameEn).toBe("Cairo University Updated");
    expect(universityRepository.update).toHaveBeenCalledWith("uni-1", updateData);
    expect(auditLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        universityId: "uni-1",
        actorId: "admin-1",
        action: "UPDATE_UNIVERSITY",
      })
    );
    expect(CacheInvalidator.invalidateUniversity).toHaveBeenCalledWith("cairo-uni");
  });

  it("should throw error if university to update does not exist", async () => {
    vi.mocked(universityRepository.findById).mockResolvedValue(null);

    await expect(
      AdminUniversityService.updateUniversity("admin-1", "non-existent", { id: "non-existent", nameEn: "Test" })
    ).rejects.toThrow("University not found");
  });
});
