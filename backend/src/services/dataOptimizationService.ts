import { prisma } from '../db';
import { cacheService } from '../utils/cache';

export interface DataRetentionPolicy {
  table: string;
  retentionDays: number;
  archiveStrategy: 'DELETE' | 'ARCHIVE' | 'COMPRESS';
  conditions?: any;
}

export interface StorageMetrics {
  tableName: string;
  recordCount: number;
  sizeInMB: number;
  lastOptimized: Date;
  optimizationNeeded: boolean;
}

/**
 * Data Optimization Service
 * Manages data retention, archiving, and storage optimization
 */
export class DataOptimizationService {
  private static instance: DataOptimizationService;
  
  // Retention policies for different data types
  private retentionPolicies: DataRetentionPolicy[] = [
    {
      table: 'ActivityLog',
      retentionDays: 90, // 3 months
      archiveStrategy: 'ARCHIVE',
      conditions: {
        createdAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      table: 'Notification',
      retentionDays: 30, // 1 month
      archiveStrategy: 'DELETE',
      conditions: {
        read: true,
        createdAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      table: 'DocumentHistory',
      retentionDays: 365, // 1 year
      archiveStrategy: 'COMPRESS',
      conditions: {
        createdAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      table: 'TaskHistory',
      retentionDays: 180, // 6 months
      archiveStrategy: 'ARCHIVE',
      conditions: {
        createdAt: {
          lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }
  ];

  public static getInstance(): DataOptimizationService {
    if (!DataOptimizationService.instance) {
      DataOptimizationService.instance = new DataOptimizationService();
    }
    return DataOptimizationService.instance;
  }

  /**
   * Get storage metrics for all tables
   */
  async getStorageMetrics(): Promise<StorageMetrics[]> {
    const metrics: StorageMetrics[] = [];
    
    try {
      // Get record counts for major tables
      const tables = [
        'User', 'Project', 'Document', 'Task', 'ActivityLog', 
        'Notification', 'Comment', 'Issue', 'DocumentHistory'
      ];

      for (const table of tables) {
        const count = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM "${table}"
        `;
        
        const size = await prisma.$queryRaw<[{ size: string }]>`
          SELECT pg_size_pretty(pg_total_relation_size('"${table}"')) as size
        `;

        metrics.push({
          tableName: table,
          recordCount: Number(count[0].count),
          sizeInMB: this.parseSizeToMB(size[0].size),
          lastOptimized: new Date(),
          optimizationNeeded: Number(count[0].count) > 10000 // Flag if > 10k records
        });
      }
    } catch (error) {
      console.error('Error getting storage metrics:', error);
    }

    return metrics;
  }

  /**
   * Clean up old data based on retention policies
   */
  async cleanupOldData(): Promise<{ deleted: number; archived: number; compressed: number }> {
    let deleted = 0;
    let archived = 0;
    let compressed = 0;

    try {
      for (const policy of this.retentionPolicies) {
        console.log(`Processing retention policy for ${policy.table}...`);
        
        switch (policy.archiveStrategy) {
          case 'DELETE':
            const deleteResult = await this.deleteOldRecords(policy);
            deleted += deleteResult;
            break;
            
          case 'ARCHIVE':
            const archiveResult = await this.archiveOldRecords(policy);
            archived += archiveResult;
            break;
            
          case 'COMPRESS':
            const compressResult = await this.compressOldRecords(policy);
            compressed += compressResult;
            break;
        }
      }
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }

    return { deleted, archived, compressed };
  }

  /**
   * Delete old records permanently
   */
  private async deleteOldRecords(policy: DataRetentionPolicy): Promise<number> {
    try {
      const result = await prisma.$executeRaw`
        DELETE FROM "${policy.table}"
        WHERE "createdAt" < NOW() - INTERVAL '${policy.retentionDays} days'
        ${policy.conditions?.read ? 'AND "read" = true' : ''}
      `;
      
      console.log(`Deleted ${result} old records from ${policy.table}`);
      return result;
    } catch (error) {
      console.error(`Error deleting old records from ${policy.table}:`, error);
      return 0;
    }
  }

  /**
   * Archive old records to archive table
   */
  private async archiveOldRecords(policy: DataRetentionPolicy): Promise<number> {
    try {
      // Create archive table if not exists
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "${policy.table}_Archive" (
          LIKE "${policy.table}" INCLUDING ALL
        )
      `;

      // Move old records to archive
      const result = await prisma.$executeRaw`
        INSERT INTO "${policy.table}_Archive"
        SELECT * FROM "${policy.table}"
        WHERE "createdAt" < NOW() - INTERVAL '${policy.retentionDays} days'
      `;

      // Delete archived records from main table
      await prisma.$executeRaw`
        DELETE FROM "${policy.table}"
        WHERE "createdAt" < NOW() - INTERVAL '${policy.retentionDays} days'
      `;

      console.log(`Archived ${result} records from ${policy.table}`);
      return result;
    } catch (error) {
      console.error(`Error archiving records from ${policy.table}:`, error);
      return 0;
    }
  }

  /**
   * Compress old records (for document history, etc.)
   */
  private async compressOldRecords(policy: DataRetentionPolicy): Promise<number> {
    try {
      // For document history, we can compress metadata
      if (policy.table === 'DocumentHistory') {
        const result = await prisma.$executeRaw`
          UPDATE "${policy.table}"
          SET "metadata" = jsonb_build_object(
            'compressed', true,
            'originalSize', jsonb_array_length("metadata"),
            'compressedAt', NOW()
          )
          WHERE "createdAt" < NOW() - INTERVAL '${policy.retentionDays} days'
          AND "metadata" IS NOT NULL
        `;
        
        console.log(`Compressed ${result} records from ${policy.table}`);
        return result;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error compressing records from ${policy.table}:`, error);
      return 0;
    }
  }

  /**
   * Optimize database indexes
   */
  async optimizeIndexes(): Promise<void> {
    try {
      console.log('Optimizing database indexes...');
      
      // Analyze tables for better query planning
      await prisma.$executeRaw`ANALYZE`;
      
      // Reindex tables that might be fragmented
      const tables = ['ActivityLog', 'Notification', 'DocumentHistory', 'TaskHistory'];
      
      for (const table of tables) {
        await prisma.$executeRaw`REINDEX TABLE "${table}"`;
      }
      
      console.log('Database indexes optimized successfully');
    } catch (error) {
      console.error('Error optimizing indexes:', error);
    }
  }

  /**
   * Clear old cache entries
   */
  async clearOldCache(): Promise<number> {
    try {
      // Clear all cache entries (simplified approach)
      await cacheService.flush();
      console.log('Cache cleared successfully');
      return 1;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return 0;
    }
  }

  /**
   * Parse size string to MB
   */
  private parseSizeToMB(sizeStr: string): number {
    const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*(\w+)/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'kb': return value / 1024;
      case 'mb': return value;
      case 'gb': return value * 1024;
      case 'tb': return value * 1024 * 1024;
      default: return 0;
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const metrics = await this.getStorageMetrics();
    
    for (const metric of metrics) {
      if (metric.recordCount > 50000) {
        recommendations.push(`Consider archiving old ${metric.tableName} records (${metric.recordCount.toLocaleString()} records)`);
      }
      
      if (metric.sizeInMB > 1000) {
        recommendations.push(`Large ${metric.tableName} table detected (${metric.sizeInMB.toFixed(2)} MB)`);
      }
    }
    
    return recommendations;
  }
}

export const dataOptimizationService = DataOptimizationService.getInstance();
