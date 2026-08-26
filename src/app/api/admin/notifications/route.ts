import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../lib/auth";
import { notificationService } from "../../../../lib/di";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await notificationService.getUserNotifications(session.user.id, undefined, 1, 10);
    return NextResponse.json({
      notifications: result.data,
      total: result.total,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await notificationService.markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
