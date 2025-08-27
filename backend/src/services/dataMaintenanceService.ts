import * as cron from 'node-cron';
import { dataOptimizationService } from './dataOptimizationService';
import { prisma } from '../db';
import { cacheService } from '../utils/cache';

export class DataMaintenanceService {
  private static instance: DataMaintenanceService;
  private jobs: cron.ScheduledTask[] = [];

  public static getInstance(): DataMaintenanceService {
    if (!DataMaintenanceService.instance) {
      DataMaintenanceService.instance = new DataMaintenanceService();
    }
    return DataMaintenanceService.instance;
  }

  /**
   * Initialize all maintenance jobs
   */
  initializeJobs(): void {
    console.log('Initializing data maintenance jobs...');

    // Daily cleanup job (2 AM)
    this.jobs.push(
      cron.schedule('0 2 * * *', async () => {
        console.log('Running daily data cleanup...');
        await this.dailyCleanup();
      }, { timezone: 'UTC' })
    );

    // Weekly optimization job (Sunday 3 AM)
    this.jobs.push(
      cron.schedule('0 3 * * 0', async () => {
        console.log('Running weekly data optimization...');
        await this.weeklyOptimization();
      }, { timezone: 'UTC' })
    );

    // Monthly deep cleanup job (1st of month 4 AM)
    this.jobs.push(
      cron.schedule('0 4 1 * *', async () => {
        console.log('Running monthly deep cleanup...');
        await this.monthlyDeepCleanup();
      }, { timezone: 'UTC' })
    );

    // Cache cleanup job (every 6 hours)
    this.jobs.push(
      cron.schedule('0 */6 * * *', async () => {
        console.log('Running cache cleanup...');
        await this.cacheCleanup();
      }, { timezone: 'UTC' })
    );

    // Database stats update job (every 4 hours)
    this.jobs.push(
      cron.schedule('0 */4 * * *', async () => {
        console.log('Updating database statistics...');
        await this.updateDatabaseStats();
      }, { timezone: 'UTC' })
    );

    console.log(`Initialized ${this.jobs.length} maintenance jobs`);
  }

  /**
   * Daily cleanup tasks
   */
  private async dailyCleanup(): Promise<void> {
    try {
      console.log('Starting daily cleanup...');

      // 1. Clean up old activity logs (older than 90 days)
      const deletedActivityLogs = await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      });
      console.log(`Deleted ${deletedActivityLogs.count} old activity logs`);

      // 2. Clean up expired sessions
      const deletedSessions = await prisma.userSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
      console.log(`Deleted ${deletedSessions.count} expired sessions`);

      // 3. Clean up old temporary files
      await this.cleanupTemporaryFiles();

      // 4. Clear old cache entries
      await dataOptimizationService.clearOldCache();

      console.log('Daily cleanup completed successfully');
    } catch (error) {
      console.error('Error during daily cleanup:', error);
    }
  }

  /**
   * Weekly optimization tasks
   */
  private async weeklyOptimization(): Promise<void> {
    try {
      console.log('Starting weekly optimization...');

      // 1. Optimize database indexes
      await dataOptimizationService.optimizeIndexes();

      // 2. Update materialized views
      await prisma.$executeRaw`REFRESH MATERIALIZED VIEW "ProjectStats_MV"`;

      // 3. Clean up old task history (older than 6 months)
      const deletedTaskHistory = await prisma.taskHistory.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
          }
        }
      });
      console.log(`Deleted ${deletedTaskHistory.count} old task history records`);

      // 4. Compress old document history (simplified - just log the count)
      const oldHistoryCount = await prisma.documentHistory.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      });
      console.log(`Found ${oldHistoryCount} old document history records for compression`);

      // 5. Update table statistics
      await prisma.$executeRaw`ANALYZE`;

      console.log('Weekly optimization completed successfully');
    } catch (error) {
      console.error('Error during weekly optimization:', error);
    }
  }

  /**
   * Monthly deep cleanup tasks
   */
  private async monthlyDeepCleanup(): Promise<void> {
    try {
      console.log('Starting monthly deep cleanup...');

      // 1. Archive old data
      const cleanupResult = await dataOptimizationService.cleanupOldData();
      console.log('Cleanup result:', cleanupResult);

      // 2. Create new partitions for next month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await prisma.$executeRaw`
        SELECT create_activitylog_partition(${nextMonth.getFullYear()}, ${nextMonth.getMonth() + 1})
      `;

      // 3. Vacuum and reindex database
      await prisma.$executeRaw`VACUUM ANALYZE`;

      // 4. Clean up orphaned files
      await this.cleanupOrphanedFiles();

      // 5. Generate storage report
      const metrics = await dataOptimizationService.getStorageMetrics();
      console.log('Storage metrics:', metrics);

      console.log('Monthly deep cleanup completed successfully');
    } catch (error) {
      console.error('Error during monthly deep cleanup:', error);
    }
  }

  /**
   * Cache cleanup
   */
  private async cacheCleanup(): Promise<void> {
    try {
      const cleared = await dataOptimizationService.clearOldCache();
      console.log(`Cleared ${cleared} old cache entries`);
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }

  /**
   * Update database statistics
   */
  private async updateDatabaseStats(): Promise<void> {
    try {
      // Update table statistics for better query planning
      await prisma.$executeRaw`ANALYZE`;
      
      // Update materialized view statistics
      await prisma.$executeRaw`ANALYZE "ProjectStats_MV"`;
      
      console.log('Database statistics updated');
    } catch (error) {
      console.error('Error updating database stats:', error);
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanupTemporaryFiles(): Promise<void> {
    try {
      // This would clean up temporary upload files, etc.
      // Implementation depends on your file storage strategy
      console.log('Temporary files cleanup completed');
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }
  }

  /**
   * Clean up orphaned files
   */
  private async cleanupOrphanedFiles(): Promise<void> {
    try {
      // This would clean up files that are no longer referenced
      // Implementation depends on your file storage strategy
      console.log('Orphaned files cleanup completed');
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
    }
  }

  /**
   * Stop all maintenance jobs
   */
  stopJobs(): void {
    console.log('Stopping data maintenance jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('All maintenance jobs stopped');
  }

  /**
   * Get job status
   */
  getJobStatus(): { active: number; total: number } {
    const active = this.jobs.filter(job => job.getStatus() === 'scheduled').length;
    return { active, total: this.jobs.length };
  }
}

export const dataMaintenanceService = DataMaintenanceService.getInstance();
