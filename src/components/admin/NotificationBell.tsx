"use client";

import React, { useState } from "react";
import { Bell, Check, ExternalLink, Sparkles, Inbox, X } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { markNotificationReadAction, markAllNotificationsReadAction } from "../../server/actions/admin/notification.admin.actions";
import Link from "next/link";
import { format } from "date-fns";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsReadLocal, markAllAsReadLocal } = useNotifications();

  const handleMarkOne = async (id: string) => {
    markAsReadLocal(id);
    await markNotificationReadAction({ id });
  };

  const handleMarkAll = async () => {
    markAllAsReadLocal();
    await markAllNotificationsReadAction(undefined);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-[#111422] border border-[#1D2336] hover:border-purple-500/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#A78BFA] text-[#0A0B14] px-1 text-[10px] font-extrabold shadow-md shadow-purple-500/50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-96 rounded-3xl bg-[#101320] border border-[#21283D] shadow-2xl z-50 overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#1C2236] flex items-center justify-between bg-[#0C0F1A]">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Alerts & Feed</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto custom-dark-scrollbar divide-y divide-[#181E30]">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-2">
                  <Inbox className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">All caught up</p>
                  <p className="text-[10px] text-slate-500">No pending operational alerts.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-[#151A2B] transition-colors ${
                      !n.isRead ? "bg-purple-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                              n.type === "NEW_SUGGESTION"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {n.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{n.title}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {format(new Date(n.createdAt), "MMM d, HH:mm")}
                        </span>
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkOne(n.id)}
                          className="p-1 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-[#1E253A]"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#0C0F1A] border-t border-[#1C2236] text-center">
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                View all notifications &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
