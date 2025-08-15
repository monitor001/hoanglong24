import { Router } from 'express';
import { getActivityLogs } from '../controllers/activityLogController';
import { authMiddleware } from '../middlewares/simpleAuth';

const router = Router();

router.use(authMiddleware);
router.get('/', getActivityLogs);

export default router; 