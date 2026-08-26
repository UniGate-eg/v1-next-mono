"use server";

import { withAdminAuth } from "../withAdminAuth";
import { roleManagementService } from "../../../lib/di";
import { CreateRoleSchema, UpdateRoleSchema, CreateRoleInput, UpdateRoleInput } from "../../../schemas/role.schema";
import { revalidatePath } from "next/cache";

export const createRoleAction = withAdminAuth(
  "roles:manage",
  async (ctx, input: CreateRoleInput) => {
    const validated = CreateRoleSchema.parse(input);
    const role = await roleManagementService.createCustomRole(ctx, validated);
    revalidatePath("/admin/roles");
    return role;
  }
);

export const updateRoleAction = withAdminAuth(
  "roles:manage",
  async (ctx, input: UpdateRoleInput) => {
    const validated = UpdateRoleSchema.parse(input);
    const role = await roleManagementService.updateRole(ctx, validated);
    revalidatePath("/admin/roles");
    return role;
  }
);

export const deleteRoleAction = withAdminAuth(
  "roles:manage",
  async (ctx, { id }: { id: string }) => {
    await roleManagementService.deleteCustomRole(ctx, id);
    revalidatePath("/admin/roles");
    return { success: true };
  }
);
