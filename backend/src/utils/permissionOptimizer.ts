import { prisma } from '../db';
import { PermissionUtils } from './permissionUtils';

// Performance monitoring
interface PermissionMetrics {
  totalChecks: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  slowQueries: number;
  errors: number;
}

// Advanced caching with TTL and LRU eviction
class PermissionCache {
  private cache = new Map<string, { value: any; timestamp: number; accessCount: number }>();
  private readonly maxSize = 1000;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private metrics: PermissionMetrics = {
    totalChecks: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    slowQueries: 0,
    errors: 0
  };

  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) {
      this.metrics.cacheMisses++;
      return null;
    }

    // Check TTL
    if (Date.now() - item.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }

    // Update access count for LRU
    item.accessCount++;
    this.metrics.cacheHits++;
    return item.value;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < oldestAccess) {
        oldestAccess = item.accessCount;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getMetrics(): PermissionMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalChecks: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      slowQueries: 0,
      errors: 0
    };
  }
}

// Optimized permission checker
export class PermissionOptimizer {
  private static instance: PermissionOptimizer;
  private cache = new PermissionCache();
  private batchQueue: Array<{ check: any; resolve: Function; reject: Function }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly batchDelay = 50; // 50ms batch delay

  static getInstance(): PermissionOptimizer {
    if (!PermissionOptimizer.instance) {
      PermissionOptimizer.instance = new PermissionOptimizer();
    }
    return PermissionOptimizer.instance;
  }

  /**
   * Optimized permission check with batching and caching
   */
  async checkPermission(userId: string, permission: string, options?: {
    projectId?: string;
    resourceId?: string;
    bypassCache?: boolean;
  }): Promise<boolean> {
    const startTime = Date.now();
    const cacheKey = `${userId}:${permission}:${options?.projectId || 'global'}:${options?.resourceId || 'global'}`;

    try {
      // Check cache first (unless bypassed)
      if (!options?.bypassCache) {
        const cached = this.cache.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
      }

      // Use batch processing for multiple checks
      const result = await this.batchPermissionCheck({
        userId,
        permission,
        projectId: options?.projectId,
        resourceId: options?.resourceId
      });

      // Cache the result
      this.cache.set(cacheKey, result);

      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);

      return result;
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, true);
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Batch multiple permission checks for better performance
   */
  async batchPermissionCheck(check: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ check, resolve, reject });

      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.batchDelay);
    });
  }

  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0);
    const userIds = [...new Set(batch.map(item => item.check.userId))];
    const permissions = [...new Set(batch.map(item => item.check.permission))];

    try {
      // Fetch all user permissions in one query
      const userPermissions = await this.fetchUserPermissionsBatch(userIds);

      // Process results
      batch.forEach(item => {
        const userPerms = userPermissions.get(item.check.userId);
        const hasPermission = userPerms?.has(item.check.permission) || false;
        item.resolve(hasPermission);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }

  /**
   * Fetch permissions for multiple users in one query
   */
  private async fetchUserPermissionsBatch(userIds: string[]): Promise<Map<string, Set<string>>> {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true }
    });

    const roleCodes = [...new Set(users.map(u => u.role))];

    // Fetch all role permissions in one query
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: { code: { in: roleCodes } },
        granted: true,
        permission: { isActive: true }
      },
      include: {
        role: true,
        permission: true
      }
    });

    // Build permission map for each user
    const userPermissionsMap = new Map<string, Set<string>>();

    for (const user of users) {
      const permissions = new Set<string>();
      const userRolePermissions = rolePermissions.filter(rp => rp.role.code === user.role);
      
      userRolePermissions.forEach(rp => {
        permissions.add(rp.permission.code);
      });

      userPermissionsMap.set(user.id, permissions);
    }

    return userPermissionsMap;
  }

  /**
   * Check multiple permissions for a user efficiently
   */
  async checkMultiplePermissions(userId: string, permissions: string[], options?: {
    projectId?: string;
    resourceId?: string;
  }): Promise<Map<string, boolean>> {
    const startTime = Date.now();
    const results = new Map<string, boolean>();

    try {
      // Check cache first for each permission
      const uncachedPermissions: string[] = [];
      const cacheKeys: string[] = [];

      for (const permission of permissions) {
        const cacheKey = `${userId}:${permission}:${options?.projectId || 'global'}:${options?.resourceId || 'global'}`;
        cacheKeys.push(cacheKey);
        
        const cached = this.cache.get(cacheKey);
        if (cached !== null) {
          results.set(permission, cached);
        } else {
          uncachedPermissions.push(permission);
        }
      }

      // Fetch uncached permissions
      if (uncachedPermissions.length > 0) {
        const userPermissions = await this.fetchUserPermissionsBatch([userId]);
        const userPerms = userPermissions.get(userId) || new Set();

        for (const permission of uncachedPermissions) {
          const hasPermission = userPerms.has(permission);
          results.set(permission, hasPermission);

          // Cache the result
          const cacheKey = `${userId}:${permission}:${options?.projectId || 'global'}:${options?.resourceId || 'global'}`;
          this.cache.set(cacheKey, hasPermission);
        }
      }

      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);

      return results;
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, true);
      console.error('Multiple permission check error:', error);
      return new Map();
    }
  }

  /**
   * Preload permissions for users (useful for dashboard loading)
   */
  async preloadUserPermissions(userIds: string[]): Promise<void> {
    try {
      const userPermissions = await this.fetchUserPermissionsBatch(userIds);
      
      // Cache all permissions for these users
      for (const [userId, permissions] of userPermissions.entries()) {
        for (const permission of permissions) {
          const cacheKey = `${userId}:${permission}:global:global`;
          this.cache.set(cacheKey, true);
        }
      }
    } catch (error) {
      console.error('Preload permissions error:', error);
    }
  }

  /**
   * Clear cache for specific user or all users
   */
  clearCache(userId?: string): void {
    if (userId) {
      // Clear cache for specific user
      for (const key of this.cache['cache'].keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.cache['cache'].delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PermissionMetrics {
    return this.cache.getMetrics();
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.cache.resetMetrics();
  }

  private updateMetrics(responseTime: number, isError: boolean = false): void {
    const metrics = this.cache.getMetrics();
    metrics.totalChecks++;
    metrics.averageResponseTime = (metrics.averageResponseTime + responseTime) / 2;
    
    if (responseTime > 1000) { // Consider slow if > 1 second
      metrics.slowQueries++;
    }
    
    if (isError) {
      metrics.errors++;
    }
  }
}

// Middleware for optimized permission checking
export const requireOptimizedPermission = (permission: string, options?: {
  projectId?: string;
  resourceId?: string;
  bypassCache?: boolean;
}) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const optimizer = PermissionOptimizer.getInstance();
      const hasPermission = await optimizer.checkPermission(
        req.user.id,
        permission,
        {
          projectId: options?.projectId,
          resourceId: options?.resourceId,
          bypassCache: options?.bypassCache
        }
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `Permission '${permission}' required`
        });
      }

      next();
    } catch (error) {
      console.error('Optimized permission middleware error:', error);
      return res.status(500).json({ 
        error: 'Permission check failed',
        message: 'Internal permission validation error'
      });
    }
  };
};

// Utility functions for permission management
export const PermissionManager = {
  /**
   * Grant permission to user
   */
  async grantPermission(userId: string, permission: string, grantedBy?: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) return false;

      const role = await prisma.userRole.findUnique({
        where: { code: user.role }
      });

      const perm = await prisma.permission.findUnique({
        where: { code: permission }
      });

      if (!role || !perm) return false;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id
          }
        },
        update: {
          granted: true,
          grantedById: grantedBy || null,
          grantedAt: new Date()
        },
        create: {
          roleId: role.id,
          permissionId: perm.id,
          granted: true,
          grantedById: grantedBy || null
        }
      });

      // Clear cache for this user
      PermissionOptimizer.getInstance().clearCache(userId);

      return true;
    } catch (error) {
      console.error('Grant permission error:', error);
      return false;
    }
  },

  /**
   * Revoke permission from user
   */
  async revokePermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) return false;

      const role = await prisma.userRole.findUnique({
        where: { code: user.role }
      });

      const perm = await prisma.permission.findUnique({
        where: { code: permission }
      });

      if (!role || !perm) return false;

      await prisma.rolePermission.update({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id
          }
        },
        data: {
          granted: false
        }
      });

      // Clear cache for this user
      PermissionOptimizer.getInstance().clearCache(userId);

      return true;
    } catch (error) {
      console.error('Revoke permission error:', error);
      return false;
    }
  },

  /**
   * Get user's effective permissions
   */
  async getUserEffectivePermissions(userId: string): Promise<string[]> {
    try {
      const optimizer = PermissionOptimizer.getInstance();
      const allPermissions = await prisma.permission.findMany({
        where: { isActive: true },
        select: { code: true }
      });

      const permissionCodes = allPermissions.map(p => p.code);
      const permissionMap = await optimizer.checkMultiplePermissions(userId, permissionCodes);

      return Array.from(permissionMap.entries())
        .filter(([_, hasPermission]) => hasPermission)
        .map(([permission]) => permission);
    } catch (error) {
      console.error('Get user effective permissions error:', error);
      return [];
    }
  }
};
