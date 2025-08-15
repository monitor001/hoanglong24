import { Router } from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import { getUserNotifications, markNotificationAsRead } from '../utils/taskNotification';

const router = Router();

router.use(authMiddleware);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user?.id as string);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await markNotificationAsRead(id, req.user?.id as string);
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router; 