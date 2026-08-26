export type NotificationType =
  | "NEW_SUGGESTION"
  | "DRAFT_SUBMITTED"
  | "MODERATION_DECISION"
  | "ROLE_CHANGE"
  | "SYSTEM_ALERT";

export interface AdminNotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}
