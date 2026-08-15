import { db } from "@/lib/prisma";
import type { IBookmarkRepository, BookmarkWithUniversity } from "./interfaces/IBookmarkRepository";
import type { AppStatus } from "@/schemas/bookmark.schema";

export class BookmarkRepository implements IBookmarkRepository {
  async findByUser(userId: string): Promise<BookmarkWithUniversity[]> {
    try {
      return (await db((client) =>
        client.bookmark.findMany({
          where: { userId },
          include: {
            university: {
              include: {
                majors: {
                  orderBy: { nameEn: "asc" },
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        })
      )) as BookmarkWithUniversity[];
    } catch (err) {
      console.warn("[BookmarkRepository] Database query failed:", err);
      return [];
    }
  }

  async findById(id: string): Promise<BookmarkWithUniversity | null> {
    try {
      return (await db((client) =>
        client.bookmark.findUnique({
          where: { id },
          include: {
            university: {
              include: {
                majors: {
                  orderBy: { nameEn: "asc" },
                },
              },
            },
          },
        })
      )) as BookmarkWithUniversity | null;
    } catch (err) {
      console.warn("[BookmarkRepository] Database query failed:", err);
      return null;
    }
  }

  async findByUserAndUniversity(
    userId: string,
    universityId: string
  ): Promise<BookmarkWithUniversity | null> {
    try {
      return (await db((client) =>
        client.bookmark.findUnique({
          where: {
            userId_universityId: {
              userId,
              universityId,
            },
          },
          include: {
            university: {
              include: {
                majors: {
                  orderBy: { nameEn: "asc" },
                },
              },
            },
          },
        })
      )) as BookmarkWithUniversity | null;
    } catch (err) {
      console.warn("[BookmarkRepository] Database query failed:", err);
      return null;
    }
  }

  async create(
    userId: string,
    universityId: string,
    status: AppStatus = "INTERESTED",
    notes?: string
  ): Promise<BookmarkWithUniversity> {
    return (await db((client) =>
      client.bookmark.upsert({
        where: {
          userId_universityId: {
            userId,
            universityId,
          },
        },
        update: {
          status,
          ...(notes !== undefined && { notes }),
        },
        create: {
          userId,
          universityId,
          status,
          notes,
        },
        include: {
          university: {
            include: {
              majors: {
                orderBy: { nameEn: "asc" },
              },
            },
          },
        },
      })
    )) as BookmarkWithUniversity;
  }

  async update(
    id: string,
    status?: AppStatus,
    notes?: string
  ): Promise<BookmarkWithUniversity> {
    return (await db((client) =>
      client.bookmark.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          university: {
            include: {
              majors: {
                orderBy: { nameEn: "asc" },
              },
            },
          },
        },
      })
    )) as BookmarkWithUniversity;
  }

  async delete(id: string): Promise<void> {
    await db((client) => client.bookmark.delete({ where: { id } }));
  }
}
