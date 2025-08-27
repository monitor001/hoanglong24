import { prisma } from '../db';
import { sendMail } from '../utils/email';
import { NotificationType, NotificationPriority } from '@prisma/client';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  userId: string;
  relatedId?: string;
  relatedType?: string;
  data?: any;
  expiresAt?: Date;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Create a new notification
 */
export const createNotification = async (data: CreateNotificationData) => {
  try {
    // Check user notification preferences
    const userPrefs = await prisma.userNotificationPreference.findUnique({
      where: { userId: data.userId }
    });

    // If user has disabled in-app notifications, don't create
    if (userPrefs && !userPrefs.inAppNotifications) {
      return null;
    }

    // Check quiet hours
    if (userPrefs?.quietHoursEnabled) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: userPrefs.timezone || 'Asia/Ho_Chi_Minh' 
      });
      
      const start = userPrefs.quietHoursStart || '22:00';
      const end = userPrefs.quietHoursEnd || '08:00';
      
      if (isInQuietHours(currentTime, start, end)) {
        // Still create notification but mark as low priority
        data.priority = NotificationPriority.LOW;
      }
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || NotificationPriority.MEDIUM,
        userId: data.userId,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
        data: data.data,
        expiresAt: data.expiresAt
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send email notification if enabled
    if (data.sendEmail && userPrefs?.emailNotifications && notification.user?.email) {
      await sendEmailNotification(notification);
    }

    // Send push notification if enabled
    if (data.sendPush && userPrefs?.pushNotifications) {
      await sendPushNotification(notification);
    }

    // Emit real-time notification
    if (global.io) {
      global.io.to(`user:${data.userId}`).emit('notification:new', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        relatedId: notification.relatedId,
        relatedType: notification.relatedType,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get user notifications with filters
 */
export const getUserNotifications = async (userId: string, filters: NotificationFilters = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      read,
      type,
      priority,
      startDate,
      endDate
    } = filters;

    const where: any = {
      userId,
      ...(read !== undefined && { read }),
      ...(type && { type }),
      ...(priority && { priority }),
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId // Ensure user can only mark their own notifications as read
      },
      data: { read: true }
    });

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string, userId: string) => {
  try {
    const notification = await prisma.notification.delete({
      where: {
        id: notificationId,
        userId // Ensure user can only delete their own notifications
      }
    });

    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Get notification statistics for a user
 */
export const getNotificationStats = async (userId: string) => {
  try {
    const [total, unread, byType, byPriority] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true }
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { priority: true }
      })
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<string, number>)
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    throw error;
  }
};

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = async () => {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`Cleaned up ${result.count} expired notifications`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
};

// Helper functions
const isInQuietHours = (currentTime: string, startTime: string, endTime: string): boolean => {
  const current = new Date(`2000-01-01T${currentTime}`);
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  if (start <= end) {
    // Same day quiet hours (e.g., 22:00 to 08:00)
    return current >= start || current <= end;
  } else {
    // Overnight quiet hours (e.g., 22:00 to 08:00)
    return current >= start || current <= end;
  }
};

const sendEmailNotification = async (notification: any) => {
  try {
    const priorityColors = {
      LOW: '#52c41a',
      MEDIUM: '#faad14',
      HIGH: '#fa8c16',
      CRITICAL: '#f5222d'
    };

    await sendMail({
      to: notification.user.email,
      subject: `[${notification.priority}] ${notification.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${priorityColors[notification.priority] || '#faad14'}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">${notification.title}</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">${notification.message}</p>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Độ ưu tiên: ${notification.priority}<br>
              Thời gian: ${new Date(notification.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

const sendPushNotification = async (notification: any) => {
  try {
    // TODO: Implement push notification service (Firebase, OneSignal, etc.)
    console.log('Push notification would be sent:', notification.title);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
