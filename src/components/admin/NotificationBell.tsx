"use client";

import React, { useState } from "react";
import { Bell, Check, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "../../hooks/useNotifications";

export function NotificationBell() {
  const { unreadCount, notifications, setUnreadCount, refresh } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", { method: "PATCH" });
      setUnreadCount(0);
      refresh();
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No new notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.isRead ? "bg-blue-50/40" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-2 font-medium"
                      >
                        View record <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
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
