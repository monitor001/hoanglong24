import { Request, Response } from 'express';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  CreateNotificationData
} from '../services/notificationService';
import { NotificationType, NotificationPriority } from '@prisma/client';

/**
 * Get user notifications
 * @route GET /api/notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      page = 1,
      limit = 20,
      read,
      type,
      priority,
      startDate,
      endDate
    } = req.query;

    const filters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      read: read === 'true' ? true : read === 'false' ? false : undefined,
      type: type as NotificationType,
      priority: priority as NotificationPriority,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    };

    const result = await getUserNotifications(userId, filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notification as read
 * @route PUT /api/notifications/:id/read
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await markNotificationAsRead(id, userId);
    res.status(200).json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await markAllNotificationsAsRead(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 */
export const deleteNotificationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await deleteNotification(id, userId);
    res.status(200).json({ message: 'Notification deleted successfully', notification });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

/**
 * Get notification statistics
 * @route GET /api/notifications/stats
 */
export const getNotificationStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await getNotificationStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
};

/**
 * Create notification (for internal use)
 * @route POST /api/notifications
 */
export const createNotificationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      type,
      title,
      message,
      priority,
      relatedId,
      relatedType,
      data,
      expiresAt,
      sendEmail = false,
      sendPush = false
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const notificationData: CreateNotificationData = {
      type,
      title,
      message,
      priority,
      userId,
      relatedId,
      relatedType,
      data,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      sendEmail,
      sendPush
    };

    const notification = await createNotification(notificationData);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

/**
 * Bulk create notifications (for system use)
 * @route POST /api/notifications/bulk
 */
export const createBulkNotifications = async (req: Request, res: Response) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications)) {
      return res.status(400).json({ error: 'Notifications must be an array' });
    }

    const results = [];
    for (const notificationData of notifications) {
      try {
        const notification = await createNotification(notificationData);
        results.push({ success: true, notification });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Bulk create notifications error:', error);
    res.status(500).json({ error: 'Failed to create bulk notifications' });
  }
};
