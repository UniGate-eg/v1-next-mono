import { db } from "@/lib/prisma";
import type { IUniversityRepository, UniversityWithMajors } from "./interfaces/IUniversityRepository";
import type { UniversityFilters } from "@/schemas/university.schema";

export class UniversityRepository implements IUniversityRepository {
  async findAll(filters: UniversityFilters): Promise<UniversityWithMajors[]> {
    const { type, governorate, search, page, limit } = filters;

    return db((client) =>
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
    ) as Promise<UniversityWithMajors[]>;
  }

  async findBySlug(slug: string): Promise<UniversityWithMajors | null> {
    return db((client) =>
      client.university.findUnique({
        where: { slug },
        include: {
          majors: {
            orderBy: { nameEn: "asc" },
          },
        },
      })
    ) as Promise<UniversityWithMajors | null>;
  }

  async findByIds(ids: string[]): Promise<UniversityWithMajors[]> {
    if (ids.length === 0) return [];
    return db((client) =>
      client.university.findMany({
        where: { id: { in: ids } },
        include: {
          majors: {
            orderBy: { nameEn: "asc" },
          },
        },
      })
    ) as Promise<UniversityWithMajors[]>;
  }

  async count(filters: UniversityFilters): Promise<number> {
    const { type, governorate, search } = filters;
    return db((client) =>
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
  }

  async getFeatured(): Promise<UniversityWithMajors[]> {
    return db((client) =>
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
    ) as Promise<UniversityWithMajors[]>;
  }
}
