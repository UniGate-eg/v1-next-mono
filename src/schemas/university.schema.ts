import { z } from "zod";

export const CreateUniversitySchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  shortName: z.string().min(1).max(20).optional(),
  emoji: z.string().min(1).max(10).default("🏛️"),
  nameEn: z.string().min(3).max(150),
  nameAr: z.string().min(3).max(150),
  educationModel: z.enum(["AMERICAN", "GERMAN", "BRITISH", "EGYPTIAN", "FRENCH", "CANADIAN"]),
  type: z.enum(["PUBLIC", "PRIVATE", "NATIONAL", "INTERNATIONAL"]),
  governorate: z.string().min(2).max(50),
  city: z.string().max(100).optional(),
  addressEn: z.string().optional(),
  addressAr: z.string().optional(),
  overviewEn: z.string().optional(),
  overviewAr: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().optional(),
  established: z.number().int().min(900).max(2100).optional(),
  qsRanking: z.string().optional(),
  theRanking: z.string().optional(),
  phones: z.array(z.string()).default([]),
  emails: z.array(z.string().email()).default([]),
  socialLinks: z.record(z.string()).optional(),
  strengthsEn: z.array(z.string()).default([]),
  strengthsAr: z.array(z.string()).default([]),
  publishStatus: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("PUBLISHED"),
});

export const UpdateUniversitySchema = CreateUniversitySchema.partial().extend({
  id: z.string().min(1),
});

export type CreateUniversityInput = z.infer<typeof CreateUniversitySchema>;
export type UpdateUniversityInput = z.infer<typeof UpdateUniversitySchema>;

export const UniversityFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["PUBLIC", "PRIVATE", "NATIONAL", "INTERNATIONAL"]).optional(),
  educationModel: z.enum(["AMERICAN", "GERMAN", "BRITISH", "EGYPTIAN", "FRENCH", "CANADIAN"]).optional(),
  city: z.string().optional(),
  hasMedicine: z.boolean().optional(),
  hasEngineering: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});
export type UniversityFilters = z.infer<typeof UniversityFiltersSchema>;
