import { z } from "zod";

export const CreateFacultySchema = z.object({
  universityId: z.string().min(1),
  nameEn: z.string().min(3).max(150),
  nameAr: z.string().min(3).max(150),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  deanName: z.string().optional(),
  departments: z.array(z.string()).default([]),
});

export const UpdateFacultySchema = CreateFacultySchema.partial().extend({
  id: z.string().min(1),
});

export type CreateFacultyInput = z.infer<typeof CreateFacultySchema>;
export type UpdateFacultyInput = z.infer<typeof UpdateFacultySchema>;
