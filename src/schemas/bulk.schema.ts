import { z } from "zod";

export const BulkActionSchema = z.object({
  universityIds: z.array(z.string().min(1)).min(1, "At least one university must be selected"),
  action: z.enum(["PUBLISH", "ARCHIVE", "EXPORT"]),
});

export type BulkActionInput = z.infer<typeof BulkActionSchema>;
