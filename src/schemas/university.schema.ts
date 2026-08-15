import { z } from "zod";

export const UniversityTypeSchema = z.enum([
  "PUBLIC",
  "PRIVATE",
  "NATIONAL",
  "INTERNATIONAL",
]);

export const MajorSchema = z.object({
  id: z.string().cuid(),
  slug: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  universityId: z.string().cuid(),
  duration: z.number().int().min(1).max(10),
  degree: z.string().min(1).max(100),
});

export const UniversitySchema = z.object({
  id: z.string().cuid(),
  slug: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  type: UniversityTypeSchema,
  governorate: z.string().min(1),
  website: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  established: z.number().int().min(1800).max(2100).nullable().optional(),
  majors: z.array(MajorSchema).optional(),
});

export const UniversityFiltersSchema = z.object({
  type: UniversityTypeSchema.optional(),
  governorate: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UniversityType = z.infer<typeof UniversityTypeSchema>;
export type Major = z.infer<typeof MajorSchema>;
export type University = z.infer<typeof UniversitySchema>;
export type UniversityFilters = z.infer<typeof UniversityFiltersSchema>;
