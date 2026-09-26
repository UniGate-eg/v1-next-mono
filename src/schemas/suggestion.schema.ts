import { z } from "zod";

export const CreateSuggestionSchema = z.object({
  universityId: z.string().min(1),
  suggestedField: z.string().min(1),
  suggestedValue: z.string().min(1),
  sourceUrl: z.string().url().refine((val) => {
    try {
      const parsedUrl = new URL(val);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "Invalid URL protocol. Only http and https are allowed." }).optional(),
  notes: z.string().optional(),
  suggestedByEmail: z.string().optional(),
});

export const ResolveSuggestionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["MERGED", "REJECTED"]),
  adminNotes: z.string().optional(),
});

export type CreateSuggestionInput = z.infer<typeof CreateSuggestionSchema>;
export type ResolveSuggestionInput = z.infer<typeof ResolveSuggestionSchema>;
