import { PrismaClient, Prisma } from "@prisma/client";
import { IAdminNotificationRepository, CreateNotificationInput } from "./interfaces/IAdminNotificationRepository";
import { AdminNotificationDTO, NotificationFilters } from "../../types/notification.types";
import { AdminNotificationMapper } from "../mappers/AdminNotificationMapper";

export class PostgresAdminNotificationRepository implements IAdminNotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateNotificationInput): Promise<AdminNotificationDTO> {
    const notification = await this.prisma.adminNotification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type as any,
        link: data.link,
      }
    });
    return AdminNotificationMapper.toDTO(notification);
  }

  async createMany(items: CreateNotificationInput[]): Promise<number> {
    if (items.length === 0) return 0;
    const result = await this.prisma.adminNotification.createMany({
      data: items.map(i => ({
        userId: i.userId,
        title: i.title,
        message: i.message,
        type: i.type as any,
        link: i.link,
      }))
    });
    return result.count;
  }

  async findForUser(
    userId: string,
    filters?: NotificationFilters,
    page = 1,
    limit = 20
  ): Promise<{ data: AdminNotificationDTO[]; total: number; unreadCount: number }> {
    const where: Prisma.AdminNotificationWhereInput = {
      userId,
      ...(filters?.isRead !== undefined && { isRead: filters.isRead }),
      ...(filters?.type && { type: filters.type as any }),
    };

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.adminNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.adminNotification.count({ where }),
      this.prisma.adminNotification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications.map(AdminNotificationMapper.toDTO),
      total,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.prisma.adminNotification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.adminNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.adminNotification.count({
      where: { userId, isRead: false }
    });
  }
}
