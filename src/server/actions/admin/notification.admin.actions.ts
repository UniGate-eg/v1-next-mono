"use server";

import { withAdminAuth } from "../withAdminAuth";
import { notificationService } from "../../../lib/di";
import { revalidatePath } from "next/cache";

export const markNotificationReadAction = withAdminAuth(
  "dashboard:access" as any,
  async (ctx, { id }: { id: string }) => {
    await notificationService.markAsRead(id, ctx.id);
    revalidatePath("/admin/notifications");
    return { success: true };
  }
);

export const markAllNotificationsReadAction = withAdminAuth(
  "dashboard:access" as any,
  async (ctx) => {
    await notificationService.markAllAsRead(ctx.id);
    revalidatePath("/admin/notifications");
    return { success: true };
  }
);
