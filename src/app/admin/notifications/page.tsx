import { headers } from "next/headers";
import { auth } from "../../../lib/auth";
import { notificationService } from "../../../lib/di";
import { Bell, Check, ExternalLink, Sparkles, Inbox } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const result = await notificationService.getUserNotifications(session!.user.id, undefined, 1, 50);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" /> Notifications & Administrative Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of suggestion submissions, draft publications, role updates, and system events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            {result.unreadCount} Unread
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {result.data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No notifications in your inbox</p>
            <p className="text-xs text-slate-400">You're all caught up with platform events.</p>
          </div>
        ) : (
          result.data.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors ${
                !n.isRead ? "bg-blue-50/30" : ""
              }`}
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      n.type === "NEW_SUGGESTION"
                        ? "bg-amber-100 text-amber-700"
                        : n.type === "DRAFT_SUBMITTED"
                        ? "bg-blue-100 text-blue-700"
                        : n.type === "ROLE_CHANGE"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {n.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <span>{format(new Date(n.createdAt), "MMM d, yyyy HH:mm")}</span>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                    >
                      Open Target <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
