import { Request, Response } from 'express';
import { prisma } from '../db';
import { PermissionUtils } from '../utils/permissionUtils';

// Get comprehensive permission matrix for all modules
export const getPermissionMatrix = async (req: Request, res: Response) => {
  try {
    // Get all roles from database
    const allRoles = await prisma.userRole.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });

    // Get all permissions from database
    const permissions = await prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Get all role permissions from database
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: { isActive: true },
        permission: { isActive: true }
      },
      include: {
        role: true,
        permission: true
      }
    });

    // Build matrix
    const matrix: { [key: string]: { [key: string]: boolean } } = {};
    
    for (const permission of permissions) {
      matrix[permission.code] = {};
      for (const role of allRoles) {
        const rolePermission = rolePermissions.find(rp => 
          rp.role.code === role.code && rp.permission.code === permission.code
        );
        matrix[permission.code][role.code] = rolePermission?.granted || false;
      }
    }

    const result = {
      permissions: permissions.map(p => ({
        id: p.code,
        name: p.name,
        nameVi: p.nameVi,
        description: p.description,
        category: p.category
      })),
      roles: allRoles.map(r => ({
        id: r.code,
        name: r.name,
        nameVi: r.nameVi,
        color: r.color,
        description: r.description
      })),
      rolePermissionMatrix: matrix
    };

    res.json(result);
  } catch (error) {
    console.error('Error getting permission matrix:', error);
    res.status(500).json({ error: 'Failed to get permission matrix' });
  }
};

// Update permission matrix
export const updatePermissionMatrix = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rolePermissionMatrix } = req.body;
    
    // Check if user has admin permissions from database
    const userPermissions = await PermissionUtils.getUserPermissions(userId);
    if (!userPermissions.has('manage_permissions')) {
      return res.status(403).json({ 
        error: 'Access denied. Only users with manage_permissions can update permission matrix.' 
      });
    }
    
    if (!rolePermissionMatrix) {
      return res.status(400).json({ error: 'Role permission matrix is required' });
    }

    // Validate matrix structure
    if (typeof rolePermissionMatrix !== 'object') {
      return res.status(400).json({ error: 'Invalid matrix format' });
    }

    // Update permission matrix in database
    await PermissionUtils.updatePermissionMatrix(rolePermissionMatrix);

    res.json({ message: 'Permission matrix updated successfully' });
  } catch (error) {
    console.error('Error updating permission matrix:', error);
    res.status(500).json({ error: 'Failed to update permission matrix' });
  }
};

// Get system configuration
export const getSystemConfig = async (req: Request, res: Response) => {
  try {
    const config = await prisma.systemSetting.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });
    res.json(config);
  } catch (error) {
    console.error('Error getting system config:', error);
    res.status(500).json({ error: 'Failed to get system configuration' });
  }
};

// Get user permissions
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.userId || (req as any).user.id;

    // Get user with role
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Method 1: Get role permissions using role code
    let rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: {
          code: user.role
        },
        granted: true,
        permission: { isActive: true }
      },
      include: {
        permission: true
      }
    });

    // Method 2: If no permissions found, try using role name directly
    if (rolePermissions.length === 0) {
      rolePermissions = await prisma.rolePermission.findMany({
        where: {
          role: {
            name: user.role
          },
          granted: true,
          permission: { isActive: true }
        },
        include: {
          permission: true
        }
      });
    }

    // Method 3: If still no permissions, try case-insensitive search
    if (rolePermissions.length === 0) {
      const allRoles = await prisma.userRole.findMany({
        where: { isActive: true }
      });
      
      const matchingRole = allRoles.find(r => 
        r.code.toLowerCase() === user.role.toLowerCase() ||
        r.name.toLowerCase() === user.role.toLowerCase()
      );
      
      if (matchingRole) {
        rolePermissions = await prisma.rolePermission.findMany({
          where: {
            roleId: matchingRole.id,
            granted: true,
            permission: { isActive: true }
          },
          include: {
            permission: true
          }
        });
      }
    }

    // Extract permission codes
    const permissions = rolePermissions.map(rp => rp.permission.code);
    
    res.json({ permissions });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({ error: 'Failed to get user permissions' });
  }
};

// Get all permissions
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    
    res.json(permissions);
  } catch (error) {
    console.error('Error getting all permissions:', error);
    res.status(500).json({ error: 'Failed to get all permissions' });
  }
};

// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.userRole.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    res.json(roles);
  } catch (error) {
    console.error('Error getting all roles:', error);
    res.status(500).json({ error: 'Failed to get all roles' });
  }
};

// Reset permission matrix to defaults
export const resetPermissionMatrix = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Check if user has admin permissions from database
    const userPermissions = await PermissionUtils.getUserPermissions(userId);
    if (!userPermissions.has('manage_permissions')) {
      return res.status(403).json({ 
        error: 'Access denied. Only users with manage_permissions can reset permission matrix.' 
      });
    }

    // Import and run the seeding function
    const { seedPermissionsAndRoles } = require('../utils/seedPermissions');
    await seedPermissionsAndRoles();

    res.json({ message: 'Permission matrix reset to defaults successfully' });
  } catch (error) {
    console.error('Error resetting permission matrix:', error);
    res.status(500).json({ error: 'Failed to reset permission matrix' });
  }
};

// Update system configuration
export const updateSystemConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { configs } = req.body;
    
    // Check if user has admin permissions from database
    const userPermissions = await PermissionUtils.getUserPermissions(userId);
    if (!userPermissions.has('edit_settings')) {
      return res.status(403).json({ 
        error: 'Access denied. Only users with edit_settings can update system configuration.' 
      });
    }

    if (!Array.isArray(configs)) {
      return res.status(400).json({ error: 'Configs must be an array' });
    }

    for (const config of configs) {
      if (!config.key || !config.value) {
        return res.status(400).json({ error: 'Key and value are required for each config' });
      }

      await prisma.systemSetting.upsert({
        where: { key: config.key },
        update: {
          value: config.value,
          description: config.description,
          category: config.category,
          updatedById: userId
        },
        create: {
          key: config.key,
          value: config.value,
          description: config.description,
          category: config.category,
          createdById: userId
        }
      });
    }

    res.json({ message: 'System configuration updated successfully' });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ error: 'Failed to update system configuration' });
  }
};

// Get permission statistics
export const getPermissionStatistics = async (req: Request, res: Response) => {
  try {
    const [
      totalPermissions,
      totalRoles,
      totalRolePermissions,
      totalUsers,
      cacheStats
    ] = await Promise.all([
      prisma.permission.count({ where: { isActive: true } }),
      prisma.userRole.count({ where: { isActive: true } }),
      prisma.rolePermission.count({ where: { granted: true } }),
      prisma.user.count(),
      PermissionUtils.getCacheStats()
    ]);

    res.json({
      totalPermissions,
      totalRoles,
      totalRolePermissions,
      totalUsers,
      cacheStats
    });
  } catch (error) {
    console.error('Error getting permission statistics:', error);
    res.status(500).json({ error: 'Failed to get permission statistics' });
  }
}; 