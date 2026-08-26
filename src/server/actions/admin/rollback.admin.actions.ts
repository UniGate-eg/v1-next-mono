"use server";

import { withAdminAuth } from "../withAdminAuth";
import { rollbackService } from "../../../lib/di";
import { revalidatePath } from "next/cache";

export const validateRollbackPreflightAction = withAdminAuth(
  "data:rollback",
  async (ctx, { auditLogId }: { auditLogId: string }) => {
    return rollbackService.validatePreflight(auditLogId);
  }
);

export const executeRollbackAction = withAdminAuth(
  "data:rollback",
  async (ctx, { auditLogId }: { auditLogId: string }) => {
    const result = await rollbackService.execute(auditLogId, ctx.id, ctx.email);
    revalidatePath("/admin/universities");
    revalidatePath("/admin/audit-log");
    revalidatePath("/admin/audit");
    return result;
  }
);
