import { Request, Response } from 'express';
import { dataOptimizationService } from '../services/dataOptimizationService';
import { dataMaintenanceService } from '../services/dataMaintenanceService';
import { cacheService } from '../utils/cache';

/**
 * Get storage metrics for all tables
 * @route GET /api/admin/storage-metrics
 */
export const getStorageMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = await dataOptimizationService.getStorageMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error getting storage metrics:', error);
    res.status(500).json({ error: 'Failed to get storage metrics' });
  }
};

/**
 * Get maintenance jobs status
 * @route GET /api/admin/maintenance-jobs
 */
export const getMaintenanceJobs = async (req: Request, res: Response) => {
  try {
    const jobStatus = dataMaintenanceService.getJobStatus();
    
    // Mock job data for now - in real implementation, this would come from a job scheduler
    const jobs = [
      {
        name: 'Daily Cleanup',
        schedule: '0 2 * * *',
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'completed' as const
      },
      {
        name: 'Weekly Optimization',
        schedule: '0 3 * * 0',
        lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'idle' as const
      },
      {
        name: 'Monthly Deep Cleanup',
        schedule: '0 4 1 * *',
        lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'idle' as const
      },
      {
        name: 'Cache Cleanup',
        schedule: '0 */6 * * *',
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000),
        status: 'completed' as const
      },
      {
        name: 'Database Stats Update',
        schedule: '0 */4 * * *',
        lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: 'completed' as const
      }
    ];

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error getting maintenance jobs:', error);
    res.status(500).json({ error: 'Failed to get maintenance jobs' });
  }
};

/**
 * Get optimization recommendations
 * @route GET /api/admin/optimization-recommendations
 */
export const getOptimizationRecommendations = async (req: Request, res: Response) => {
  try {
    const recommendations = await dataOptimizationService.getOptimizationRecommendations();
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error getting optimization recommendations:', error);
    res.status(500).json({ error: 'Failed to get optimization recommendations' });
  }
};

/**
 * Manual cleanup
 * @route POST /api/admin/manual-cleanup
 */
export const manualCleanup = async (req: Request, res: Response) => {
  try {
    const result = await dataOptimizationService.cleanupOldData();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({ error: 'Failed to perform manual cleanup' });
  }
};

/**
 * Optimize database indexes
 * @route POST /api/admin/optimize-indexes
 */
export const optimizeIndexes = async (req: Request, res: Response) => {
  try {
    await dataOptimizationService.optimizeIndexes();
    res.status(200).json({ message: 'Database indexes optimized successfully' });
  } catch (error) {
    console.error('Error optimizing indexes:', error);
    res.status(500).json({ error: 'Failed to optimize database indexes' });
  }
};

/**
 * Clear cache
 * @route POST /api/admin/clear-cache
 */
export const clearCache = async (req: Request, res: Response) => {
  try {
    const cleared = await dataOptimizationService.clearOldCache();
    res.status(200).json({ cleared, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};
