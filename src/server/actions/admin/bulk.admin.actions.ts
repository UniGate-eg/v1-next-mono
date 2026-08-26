"use server";

import { withAdminAuth } from "../withAdminAuth";
import { bulkOperationService } from "../../../lib/di";
import { BulkActionSchema, BulkActionInput } from "../../../schemas/bulk.schema";
import { revalidatePath } from "next/cache";

export const bulkPublishAction = withAdminAuth(
  "data:bulk_mutate",
  async (ctx, input: BulkActionInput) => {
    const validated = BulkActionSchema.parse(input);
    const result = await bulkOperationService.bulkUpdateStatus(validated.universityIds, "PUBLISHED", ctx);
    revalidatePath("/admin/universities");
    return result;
  }
);

export const bulkArchiveAction = withAdminAuth(
  "data:bulk_mutate",
  async (ctx, input: BulkActionInput) => {
    const validated = BulkActionSchema.parse(input);
    const result = await bulkOperationService.bulkUpdateStatus(validated.universityIds, "ARCHIVED", ctx);
    revalidatePath("/admin/universities");
    return result;
  }
);
