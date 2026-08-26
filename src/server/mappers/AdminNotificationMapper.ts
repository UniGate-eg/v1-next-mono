import { AdminNotificationDTO } from "../../types/notification.types";

export class AdminNotificationMapper {
  static toDTO(notification: any): AdminNotificationDTO {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link ?? null,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
