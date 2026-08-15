import type { IBookmarkRepository, BookmarkWithUniversity } from "@/server/repositories/interfaces/IBookmarkRepository";
import {
  CreateBookmarkSchema,
  UpdateBookmarkSchema,
  type CreateBookmarkInput,
  type UpdateBookmarkInput,
} from "@/schemas/bookmark.schema";

export class BookmarkService {
  constructor(private readonly bookmarkRepo: IBookmarkRepository) {}

  async getUserBookmarks(userId: string): Promise<BookmarkWithUniversity[]> {
    if (!userId) throw new Error("User ID is required");
    return this.bookmarkRepo.findByUser(userId);
  }

  async createBookmark(
    userId: string,
    rawInput: unknown
  ): Promise<BookmarkWithUniversity> {
    if (!userId) throw new Error("User ID is required");
    const input = CreateBookmarkSchema.parse(rawInput);
    return this.bookmarkRepo.create(
      userId,
      input.universityId,
      input.status,
      input.notes
    );
  }

  async updateBookmark(
    userId: string,
    rawInput: unknown
  ): Promise<BookmarkWithUniversity> {
    if (!userId) throw new Error("User ID is required");
    const input = UpdateBookmarkSchema.parse(rawInput);

    const existing = await this.bookmarkRepo.findById(input.bookmarkId);
    if (!existing) {
      throw new Error("Bookmark not found");
    }

    if (existing.userId !== userId) {
      throw new Error("Unauthorized to modify this bookmark");
    }

    return this.bookmarkRepo.update(input.bookmarkId, input.status, input.notes);
  }

  async deleteBookmark(userId: string, bookmarkId: string): Promise<void> {
    if (!userId) throw new Error("User ID is required");
    const existing = await this.bookmarkRepo.findById(bookmarkId);
    if (!existing) {
      throw new Error("Bookmark not found");
    }

    if (existing.userId !== userId) {
      throw new Error("Unauthorized to delete this bookmark");
    }

    await this.bookmarkRepo.delete(bookmarkId);
  }
}
