import { z } from "zod";

export const AppStatusSchema = z.enum([
  "INTERESTED",
  "RESEARCHING",
  "APPLIED",
  "ACCEPTED",
  "REJECTED",
]);

export const CreateBookmarkSchema = z.object({
  universityId: z.string().min(1),
  status: AppStatusSchema.default("INTERESTED"),
  notes: z.string().max(500).optional(),
});

export const UpdateBookmarkSchema = z.object({
  bookmarkId: z.string().min(1),
  status: AppStatusSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type AppStatus = z.infer<typeof AppStatusSchema>;
export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof UpdateBookmarkSchema>;
