import express from 'express';
import { PermissionOptimizer, PermissionManager } from '../utils/permissionOptimizer';
import { authMiddleware } from '../middlewares/simpleAuth';

const router = express.Router();

/**
 * Get user's effective permissions (optimized)
 * @route GET /api/permissions/optimized/user/:userId
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;

    // Users can only check their own permissions unless they're admin
    if (requestingUser?.role !== 'ADMIN' && requestingUser?.id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only check your own permissions'
      });
    }

    const optimizer = PermissionOptimizer.getInstance();
    const permissions = await PermissionManager.getUserEffectivePermissions(userId);

    res.json({
      success: true,
      data: {
        userId,
        permissions,
        count: permissions.length
      }
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get user permissions'
    });
  }
});

/**
 * Check multiple permissions for a user (batch operation)
 * @route POST /api/permissions/optimized/check-multiple
 */
router.post('/check-multiple', authMiddleware, async (req, res) => {
  try {
    const { userId, permissions, projectId, resourceId } = req.body;
    const requestingUser = req.user;

    // Users can only check their own permissions unless they're admin
    if (requestingUser?.role !== 'ADMIN' && requestingUser?.id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only check your own permissions'
      });
    }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Permissions array is required'
      });
    }

    const optimizer = PermissionOptimizer.getInstance();
    const permissionMap = await optimizer.checkMultiplePermissions(userId, permissions, {
      projectId,
      resourceId
    });

    const results = Array.from(permissionMap.entries()).map(([permission, hasPermission]) => ({
      permission,
      hasPermission
    }));

    res.json({
      success: true,
      data: {
        userId,
        results,
        summary: {
          total: results.length,
          granted: results.filter(r => r.hasPermission).length,
          denied: results.filter(r => !r.hasPermission).length
        }
      }
    });
  } catch (error) {
    console.error('Check multiple permissions error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to check permissions'
    });
  }
});

/**
 * Preload permissions for multiple users (for dashboard optimization)
 * @route POST /api/permissions/optimized/preload
 */
router.post('/preload', authMiddleware, async (req, res) => {
  try {
    const { userIds } = req.body;
    const requestingUser = req.user;

    // Only admins can preload permissions for multiple users
    if (requestingUser?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can preload permissions'
      });
    }

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'User IDs array is required'
      });
    }

    const optimizer = PermissionOptimizer.getInstance();
    await optimizer.preloadUserPermissions(userIds);

    res.json({
      success: true,
      data: {
        message: `Permissions preloaded for ${userIds.length} users`,
        userIds
      }
    });
  } catch (error) {
    console.error('Preload permissions error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to preload permissions'
    });
  }
});

/**
 * Grant permission to user
 * @route POST /api/permissions/optimized/grant
 */
router.post('/grant', authMiddleware, async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const requestingUser = req.user;

    // Only admins can grant permissions
    if (requestingUser?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can grant permissions'
      });
    }

    if (!userId || !permission) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'User ID and permission are required'
      });
    }

    const success = await PermissionManager.grantPermission(userId, permission, requestingUser.id);

    if (success) {
      res.json({
        success: true,
        data: {
          message: `Permission '${permission}' granted to user ${userId}`,
          userId,
          permission,
          grantedBy: requestingUser.id
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to grant permission',
        message: 'User, role, or permission not found'
      });
    }
  } catch (error) {
    console.error('Grant permission error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to grant permission'
    });
  }
});

/**
 * Revoke permission from user
 * @route POST /api/permissions/optimized/revoke
 */
router.post('/revoke', authMiddleware, async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const requestingUser = req.user;

    // Only admins can revoke permissions
    if (requestingUser?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can revoke permissions'
      });
    }

    if (!userId || !permission) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'User ID and permission are required'
      });
    }

    const success = await PermissionManager.revokePermission(userId, permission);

    if (success) {
      res.json({
        success: true,
        data: {
          message: `Permission '${permission}' revoked from user ${userId}`,
          userId,
          permission,
          revokedBy: requestingUser.id
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to revoke permission',
        message: 'User, role, or permission not found'
      });
    }
  } catch (error) {
    console.error('Revoke permission error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to revoke permission'
    });
  }
});

/**
 * Get permission system metrics
 * @route GET /api/permissions/optimized/metrics
 */
router.get('/metrics', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.user;

    // Only admins can view metrics
    if (requestingUser?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can view metrics'
      });
    }

    const optimizer = PermissionOptimizer.getInstance();
    const metrics = optimizer.getMetrics();

    res.json({
      success: true,
      data: {
        metrics,
        cacheHitRate: metrics.totalChecks > 0 ? (metrics.cacheHits / metrics.totalChecks * 100).toFixed(2) + '%' : '0%',
        averageResponseTime: metrics.averageResponseTime.toFixed(2) + 'ms',
        slowQueryRate: metrics.totalChecks > 0 ? (metrics.slowQueries / metrics.totalChecks * 100).toFixed(2) + '%' : '0%',
        errorRate: metrics.totalChecks > 0 ? (metrics.errors / metrics.totalChecks * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get metrics'
    });
  }
});

/**
 * Reset permission system metrics
 * @route POST /api/permissions/optimized/metrics/reset
 */
router.post('/metrics/reset', authMiddleware, async (req, res) => {
  try {
    const requestingUser = req.user;

    // Only admins can reset metrics
    if (requestingUser?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can reset metrics'
      });
    }

    const optimizer = PermissionOptimizer.getInstance();
    optimizer.resetMetrics();

    res.json({
      success: true,
      data: {
        message: 'Permission system metrics reset successfully'
      }
    });
  } catch (error) {
    console.error('Reset metrics error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to reset metrics'
    });
  }
});

/**
 * Clear permission cache
 * @route POST /api/permissions/optimized/cache/clear
 */
router.post('/cache/clear', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const requestingUser = req.user;

    // Only admins can clear cache
    if (requestingUser?.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can clear cache'
      });
    }

    const optimizer = PermissionOptimizer.getInstance();
    
    if (userId) {
      optimizer.clearCache(userId);
      res.json({
        success: true,
        data: {
          message: `Permission cache cleared for user ${userId}`,
          userId
        }
      });
    } else {
      optimizer.clearCache();
      res.json({
        success: true,
        data: {
          message: 'All permission cache cleared'
        }
      });
    }
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to clear cache'
    });
  }
});

/**
 * Check if user has specific permission (optimized)
 * @route POST /api/permissions/optimized/check
 */
router.post('/check', authMiddleware, async (req, res) => {
  try {
    const { userId, permission, projectId, resourceId, bypassCache } = req.body;
    const requestingUser = req.user;

    // Users can only check their own permissions unless they're admin
    if (requestingUser?.role !== 'ADMIN' && requestingUser?.id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only check your own permissions'
      });
    }

    if (!userId || !permission) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'User ID and permission are required'
      });
    }

    const optimizer = PermissionOptimizer.getInstance();
    const hasPermission = await optimizer.checkPermission(userId, permission, {
      projectId,
      resourceId,
      bypassCache: bypassCache || false
    });

    res.json({
      success: true,
      data: {
        userId,
        permission,
        hasPermission,
        projectId,
        resourceId
      }
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to check permission'
    });
  }
});

export default router;
