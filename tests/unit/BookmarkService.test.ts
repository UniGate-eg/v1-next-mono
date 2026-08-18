import { describe, it, expect, vi } from "vitest";
import { BookmarkService } from "@/server/services/BookmarkService";
import type { IBookmarkRepository, BookmarkWithUniversity } from "@/server/repositories/interfaces/IBookmarkRepository";

const mockBookmark: BookmarkWithUniversity = {
  id: "b1",
  userId: "user123",
  universityId: "uni123",
  status: "INTERESTED",
  notes: "Submitted documents on Sunday",
  createdAt: new Date(),
  updatedAt: new Date(),
  university: {
    id: "uni123",
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
    overviewEn: "Premier Public University",
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
};

const mockRepo: IBookmarkRepository = {
  findByUser: vi.fn().mockResolvedValue([mockBookmark]),
  findById: vi.fn().mockImplementation(async (id: string) => {
    if (id === "b1") return mockBookmark;
    return null;
  }),
  findByUserAndUniversity: vi.fn().mockResolvedValue(mockBookmark),
  create: vi.fn().mockResolvedValue(mockBookmark),
  update: vi.fn().mockResolvedValue({ ...mockBookmark, status: "APPLIED" }),
  delete: vi.fn().mockResolvedValue(undefined),
};

describe("BookmarkService", () => {
  const service = new BookmarkService(mockRepo);

  it("should return user bookmarks organized by application status", async () => {
    const result = await service.getUserBookmarks("user123");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("INTERESTED");
  });

  it("should create bookmark with default INTERESTED status", async () => {
    const created = await service.createBookmark("user123", {
      universityId: "uni123",
    });
    expect(created.id).toBe("b1");
    expect(mockRepo.create).toHaveBeenCalledWith("user123", "uni123", "INTERESTED", undefined);
  });

  it("should allow bookmark status transition to APPLIED", async () => {
    const updated = await service.updateBookmark("user123", {
      bookmarkId: "b1",
      status: "APPLIED",
    });
    expect(updated.status).toBe("APPLIED");
  });

  it("should prevent updating bookmark belonging to another user", async () => {
    await expect(
      service.updateBookmark("wrong-user", {
        bookmarkId: "b1",
        status: "APPLIED",
      })
    ).rejects.toThrow("Unauthorized");
  });
});
