import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { adminMiddleware } from '../middlewares/admin';
import {
  getStorageMetrics,
  getMaintenanceJobs,
  getOptimizationRecommendations,
  manualCleanup,
  optimizeIndexes,
  clearCache
} from '../controllers/adminController';

const router = Router();

// All routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Get storage metrics
router.get('/storage-metrics', getStorageMetrics);

// Get maintenance jobs status
router.get('/maintenance-jobs', getMaintenanceJobs);

// Get optimization recommendations
router.get('/optimization-recommendations', getOptimizationRecommendations);

// Manual cleanup
router.post('/manual-cleanup', manualCleanup);

// Optimize database indexes
router.post('/optimize-indexes', optimizeIndexes);

// Clear cache
router.post('/clear-cache', clearCache);

export default router;
