import { AdminNotificationDTO, NotificationFilters, NotificationType } from "../../../types/notification.types";

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
}

export interface IAdminNotificationRepository {
  create(data: CreateNotificationInput): Promise<AdminNotificationDTO>;
  createMany(items: CreateNotificationInput[]): Promise<number>;
  findForUser(userId: string, filters?: NotificationFilters, page?: number, limit?: number): Promise<{ data: AdminNotificationDTO[]; total: number; unreadCount: number }>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}
