import { Router } from 'express';
import { authMiddleware } from '../middlewares/simpleAuth';
import { prisma } from '../db';

const router = Router();

// Apply simple auth middleware to all routes
router.use(authMiddleware);

/**
 * GET /api/permissions/test
 * Test permissions system
 */
router.get('/test', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      message: 'Permissions system is working (simplified)',
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      note: 'All permissions are temporarily disabled for development'
    });
  } catch (error) {
    console.error('Permissions test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/permissions/user
 * Get current user permissions
 */
router.get('/user', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      permissions: [],
      note: 'All permissions are temporarily disabled for development'
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/permissions/check-permission
 * Check if user has specific permission
 */
router.post('/check-permission', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { permission } = req.body;

    if (!permission) {
      return res.status(400).json({ error: 'Permission is required' });
    }

    // Temporarily return true for all permissions
    res.json({
      success: true,
      hasPermission: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      permission,
      note: 'All permissions are temporarily disabled for development'
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/permissions/check-multiple
 * Check multiple permissions for user
 */
router.post('/check-multiple', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions array is required' });
    }

    // Temporarily return true for all permissions
    const results = permissions.map(permission => ({
      permission,
      hasPermission: true
    }));

    res.json({
      success: true,
      results,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      note: 'All permissions are temporarily disabled for development'
    });
  } catch (error) {
    console.error('Check multiple permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/permissions/matrix
 * Get permission matrix (simplified)
 */
router.get('/matrix', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return empty matrix since permissions are disabled
    res.json({
      success: true,
      matrix: {},
      note: 'Permission matrix is temporarily disabled for development'
    });
  } catch (error) {
    console.error('Get permission matrix error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/permissions/update-matrix
 * Update permission matrix (simplified)
 */
router.post('/update-matrix', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      message: 'Permission matrix update is temporarily disabled for development'
    });
  } catch (error) {
    console.error('Update permission matrix error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/permissions/roles
 * Get all roles (simplified)
 */
router.get('/roles', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const roles = await prisma.userRole.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        nameVi: true,
        description: true,
        color: true
      },
      orderBy: { code: 'asc' }
    });

    res.json({
      success: true,
      roles,
      note: 'Role permissions are temporarily disabled for development'
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/permissions/roles/:roleId
 * Get role details (simplified)
 */
router.get('/roles/:roleId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { roleId } = req.params;

    const role = await prisma.userRole.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        code: true,
        name: true,
        nameVi: true,
        description: true,
        color: true
      }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({
      success: true,
      role,
      permissions: [],
      note: 'Role permissions are temporarily disabled for development'
    });
  } catch (error) {
    console.error('Get role details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/permissions/roles/:roleId
 * Update role permissions (simplified)
 */
router.put('/roles/:roleId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      message: 'Role permission updates are temporarily disabled for development'
    });
  } catch (error) {
    console.error('Update role permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
