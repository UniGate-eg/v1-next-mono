"use server";

import { withAdminAuth } from "../withAdminAuth";
import { userManagementService } from "../../../lib/di";
import { PromoteUserSchema, RevokeRoleSchema, SetUserStatusSchema, PromoteUserInput, RevokeRoleInput, SetUserStatusInput } from "../../../schemas/user.schema";
import { revalidatePath } from "next/cache";

export const promoteUserAction = withAdminAuth(
  "users:manage_staff",
  async (ctx, input: PromoteUserInput) => {
    const validated = PromoteUserSchema.parse(input);
    await userManagementService.promoteUser(ctx, validated);
    revalidatePath("/admin/users");
    return { success: true };
  }
);

export const revokeUserRoleAction = withAdminAuth(
  "users:manage_staff",
  async (ctx, input: RevokeRoleInput) => {
    const validated = RevokeRoleSchema.parse(input);
    await userManagementService.revokeRole(ctx, validated.userId, validated.roleId);
    revalidatePath("/admin/users");
    return { success: true };
  }
);

export const setUserStatusAction = withAdminAuth(
  "users:manage_staff",
  async (ctx, input: SetUserStatusInput) => {
    const validated = SetUserStatusSchema.parse(input);
    await userManagementService.setUserStatus(ctx, validated);
    revalidatePath("/admin/users");
    return { success: true };
  }
);
