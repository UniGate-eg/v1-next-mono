import { z } from "zod";

export const PromoteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  universityIds: z.array(z.string()).optional().default([]),
  expiresAt: z.string().datetime().optional().nullable(),
});

export type PromoteUserInput = z.infer<typeof PromoteUserSchema>;

export const RevokeRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
});

export type RevokeRoleInput = z.infer<typeof RevokeRoleSchema>;

export const SetUserStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  reason: z.string().optional(),
});

export type SetUserStatusInput = z.infer<typeof SetUserStatusSchema>;
