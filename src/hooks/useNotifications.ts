"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminNotificationDTO } from "../types/notification.types";

export function useNotifications(initialUnreadCount = 0) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<AdminNotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore background poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsReadLocal = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsReadLocal = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Poll every 30 seconds for new alerts
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    unreadCount,
    setUnreadCount,
    notifications,
    loading,
    refresh: fetchNotifications,
    markAsReadLocal,
    markAllAsReadLocal,
  };
}
