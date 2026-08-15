import { db } from "@/lib/prisma";
import type { IUniversityRepository, UniversityWithMajors } from "./interfaces/IUniversityRepository";
import type { UniversityFilters } from "@/schemas/university.schema";
import { FALLBACK_UNIVERSITIES } from "@/server/data/fallback-universities";

export class UniversityRepository implements IUniversityRepository {
  private filterInMemory(filters: UniversityFilters): UniversityWithMajors[] {
    const { type, governorate, search, page, limit } = filters;
    let list = [...FALLBACK_UNIVERSITIES];

    if (type) {
      list = list.filter((u) => u.type === type);
    }

    if (governorate) {
      list = list.filter(
        (u) => u.governorate.toLowerCase() === governorate.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.nameEn.toLowerCase().includes(q) ||
          u.nameAr.includes(q) ||
          (u.description && u.description.toLowerCase().includes(q)) ||
          u.majors.some(
            (m) =>
              m.nameEn.toLowerCase().includes(q) ||
              m.nameAr.includes(q) ||
              m.degree.toLowerCase().includes(q)
          )
      );
    }

    const start = (page - 1) * limit;
    return list.slice(start, start + limit);
  }

  private countInMemory(filters: UniversityFilters): number {
    const { type, governorate, search } = filters;
    let list = [...FALLBACK_UNIVERSITIES];

    if (type) {
      list = list.filter((u) => u.type === type);
    }

    if (governorate) {
      list = list.filter(
        (u) => u.governorate.toLowerCase() === governorate.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.nameEn.toLowerCase().includes(q) ||
          u.nameAr.includes(q) ||
          (u.description && u.description.toLowerCase().includes(q))
      );
    }

    return list.length;
  }

  async findAll(filters: UniversityFilters): Promise<UniversityWithMajors[]> {
    try {
      const { type, governorate, search, page, limit } = filters;

      return (await db((client) =>
        client.university.findMany({
          where: {
            ...(type && { type }),
            ...(governorate && {
              governorate: {
                equals: governorate,
                mode: "insensitive",
              },
            }),
            ...(search && {
              OR: [
                { nameEn: { contains: search, mode: "insensitive" } },
                { nameAr: { contains: search } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }),
          },
          include: {
            majors: {
              orderBy: { nameEn: "asc" },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { nameEn: "asc" },
        })
      )) as UniversityWithMajors[];
    } catch (err) {
      console.warn("[UniversityRepository] Database unavailable, using fallback dataset:", err);
      return this.filterInMemory(filters);
    }
  }

  async findBySlug(slug: string): Promise<UniversityWithMajors | null> {
    try {
      return (await db((client) =>
        client.university.findUnique({
          where: { slug },
          include: {
            majors: {
              orderBy: { nameEn: "asc" },
            },
          },
        })
      )) as UniversityWithMajors | null;
    } catch (err) {
      console.warn("[UniversityRepository] Database unavailable, using fallback dataset:", err);
      return FALLBACK_UNIVERSITIES.find((u) => u.slug === slug) || null;
    }
  }

  async findByIds(ids: string[]): Promise<UniversityWithMajors[]> {
    if (ids.length === 0) return [];
    try {
      return (await db((client) =>
        client.university.findMany({
          where: { id: { in: ids } },
          include: {
            majors: {
              orderBy: { nameEn: "asc" },
            },
          },
        })
      )) as UniversityWithMajors[];
    } catch (err) {
      console.warn("[UniversityRepository] Database unavailable, using fallback dataset:", err);
      return FALLBACK_UNIVERSITIES.filter((u) => ids.includes(u.id));
    }
  }

  async count(filters: UniversityFilters): Promise<number> {
    try {
      const { type, governorate, search } = filters;
      return await db((client) =>
        client.university.count({
          where: {
            ...(type && { type }),
            ...(governorate && {
              governorate: {
                equals: governorate,
                mode: "insensitive",
              },
            }),
            ...(search && {
              OR: [
                { nameEn: { contains: search, mode: "insensitive" } },
                { nameAr: { contains: search } },
              ],
            }),
          },
        })
      );
    } catch (err) {
      return this.countInMemory(filters);
    }
  }

  async getFeatured(): Promise<UniversityWithMajors[]> {
    try {
      const result = (await db((client) =>
        client.university.findMany({
          take: 6,
          include: {
            majors: {
              take: 5,
              orderBy: { nameEn: "asc" },
            },
          },
          orderBy: { established: "asc" },
        })
      )) as UniversityWithMajors[];

      if (result && result.length > 0) return result;
      return FALLBACK_UNIVERSITIES.slice(0, 6);
    } catch (err) {
      console.warn("[UniversityRepository] Database unavailable, using fallback dataset:", err);
      return FALLBACK_UNIVERSITIES.slice(0, 6);
    }
  }
}
