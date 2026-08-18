import { z } from "zod";

export const CreateDegreeProgramSchema = z.object({
  universityId: z.string().min(1),
  facultyId: z.string().optional(),
  slug: z.string().min(2).max(60),
  nameEn: z.string().min(3).max(150),
  nameAr: z.string().min(3).max(150),
  degreeType: z.string().min(2).max(50),
  durationYears: z.number().int().min(1).max(8).default(4),
  studyLanguage: z.string().default("English"),
  tuitionEgpPerYear: z.number().int().nonnegative().optional(),
  tuitionUsdPerYear: z.number().int().nonnegative().optional(),
  careerOpportunities: z.array(z.string()).default([]),
  dualDegreePartner: z.string().optional(),
});

export const UpdateDegreeProgramSchema = CreateDegreeProgramSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateDegreeProgramInput = z.infer<typeof CreateDegreeProgramSchema>;
export type UpdateDegreeProgramInput = z.infer<typeof UpdateDegreeProgramSchema>;
