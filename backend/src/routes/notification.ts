import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationController,
  getNotificationStatistics,
  createNotificationController,
  createBulkNotifications
} from '../controllers/notificationController';

const router = Router();

router.use(authMiddleware);

// Get user notifications
router.get('/', getNotifications);

// Get notification statistics
router.get('/stats', getNotificationStatistics);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotificationController);

// Create notification (for internal use)
router.post('/', createNotificationController);

// Bulk create notifications (for system use)
router.post('/bulk', createBulkNotifications);

export default router; 