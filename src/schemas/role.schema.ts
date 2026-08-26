import { z } from "zod";

export const CreateRoleSchema = z.object({
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(50, "Key must be at most 50 characters")
    .regex(/^[A-Z0-9_]+$/, "Key must be UPPERCASE letters, numbers, and underscores only"),
  name: z.string().min(2, "Name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  hierarchyLevel: z.number().int().min(1, "Hierarchy level must be >= 1 (0 is reserved for Super Admin)").max(999),
  permissionCodes: z.array(z.string()).default([]),
});

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;

export const UpdateRoleSchema = z.object({
  id: z.string().min(1, "Role ID is required"),
  name: z.string().min(2, "Name is required").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  hierarchyLevel: z.number().int().min(1).max(999).optional(),
  permissionCodes: z.array(z.string()).optional(),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
