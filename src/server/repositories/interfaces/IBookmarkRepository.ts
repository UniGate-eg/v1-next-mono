import type { AppStatus } from "@/schemas/bookmark.schema";
import type { UniversityDTO } from "@/types/university.types";

export type BookmarkWithUniversity = {
  id: string;
  userId: string;
  universityId: string;
  status: AppStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  university: UniversityDTO;
};

export interface IBookmarkRepository {
  findByUser(userId: string): Promise<BookmarkWithUniversity[]>;
  findById(id: string): Promise<BookmarkWithUniversity | null>;
  findByUserAndUniversity(userId: string, universityId: string): Promise<BookmarkWithUniversity | null>;
  create(userId: string, universityId: string, status?: AppStatus, notes?: string): Promise<BookmarkWithUniversity>;
  update(id: string, status?: AppStatus, notes?: string): Promise<BookmarkWithUniversity>;
  delete(id: string): Promise<void>;
}
