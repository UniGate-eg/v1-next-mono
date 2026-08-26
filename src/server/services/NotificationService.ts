import { IAdminNotificationRepository, CreateNotificationInput } from "../repositories/interfaces/IAdminNotificationRepository";
import { IUserRoleAssignmentRepository } from "../repositories/interfaces/IUserRoleAssignmentRepository";
import { PermissionCode } from "../../types/rbac.types";
import { AdminNotificationDTO, NotificationFilters } from "../../types/notification.types";

export class NotificationService {
  constructor(
    private notificationRepo: IAdminNotificationRepository,
    private assignmentRepo: IUserRoleAssignmentRepository
  ) {}

  async notifyAdminsWithPermission(
    permissionCode: PermissionCode,
    data: Omit<CreateNotificationInput, "userId">
  ): Promise<number> {
    const userIds = await this.assignmentRepo.findUsersWithPermission(permissionCode);
    if (userIds.length === 0) return 0;

    const items = userIds.map(userId => ({
      userId,
      ...data,
    }));

    return this.notificationRepo.createMany(items);
  }

  async getUserNotifications(
    userId: string,
    filters?: NotificationFilters,
    page = 1,
    limit = 20
  ): Promise<{ data: AdminNotificationDTO[]; total: number; unreadCount: number }> {
    return this.notificationRepo.findForUser(userId, filters, page, limit);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    return this.notificationRepo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepo.countUnread(userId);
  }
}
