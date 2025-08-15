import { prisma } from '../db';

// Types
export interface PermissionCheck {
  userId: string;
  permission: string;
  projectId?: string;
  resourceId?: string;
}

export interface RoleCheck {
  userId: string;
  role: string;
}

export interface ProjectAccessCheck {
  userId: string;
  projectId: string;
  requiredRole?: string;
}

// Cache for permission checks (in-memory cache)
const permissionCache = new Map<string, { result: boolean; timestamp: number }>();
const projectPermissionCache = new Map<string, { result: string[]; timestamp: number }>();
const userPermissionCache = new Map<string, { permissions: Map<string, boolean>; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Permission utility functions
export class PermissionUtils {
  /**
   * Check if user has specific permission with caching
   */
  static async hasPermission(check: PermissionCheck): Promise<boolean> {
    try {
      const cacheKey = `${check.userId}:${check.permission}:${check.projectId || 'global'}:${check.resourceId || 'global'}`;
      
      // Check cache first
      const cached = permissionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }

      // Get user with role
      const user = await prisma.user.findUnique({
        where: { id: check.userId },
        select: { role: true }
      });

      if (!user) return false;

      // Get user's permissions from cache or database
      const userPermissions = await this.getUserPermissions(check.userId);
      const hasPermission = userPermissions.has(check.permission);

      // Cache the result
      permissionCache.set(cacheKey, { result: hasPermission, timestamp: Date.now() });
      return hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user with caching
   */
  static async getUserPermissions(userId: string): Promise<Map<string, boolean>> {
    try {
      // Check cache first
      const cached = userPermissionCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.permissions;
      }

      // Get user with role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) return new Map();

      // Get all permissions from database
      const allPermissions = await prisma.permission.findMany({
        where: { isActive: true },
        select: { code: true }
      });

      // Build permission map
      const permissionMap = new Map<string, boolean>();
      
      // Set all permissions to false by default
      allPermissions.forEach(p => permissionMap.set(p.code, false));

      // Get role permissions from database for all users (including ADMIN)
      const rolePermissions = await prisma.rolePermission.findMany({
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
      
      // Set granted permissions to true
      rolePermissions.forEach(rp => {
        permissionMap.set(rp.permission.code, true);
      });

      userPermissionCache.set(userId, { permissions: permissionMap, timestamp: Date.now() });
      return permissionMap;
    } catch (error) {
      console.error('Get user permissions error:', error);
      return new Map();
    }
  }

  /**
   * Get permission matrix for all roles and permissions
   */
  static async getPermissionMatrix() {
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

      return {
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
    } catch (error) {
      console.error('Get permission matrix error:', error);
      throw error;
    }
  }

  /**
   * Update permission matrix in database
   */
  static async updatePermissionMatrix(matrix: any): Promise<void> {
    try {
      // Get all roles and permissions from database
      const allRoles = await prisma.userRole.findMany({
        where: { isActive: true }
      });
      const permissions = await prisma.permission.findMany({
        where: { isActive: true }
      });

      // Create maps for faster lookup
      const permissionMap = new Map(permissions.map(p => [p.code, p]));
      const roleMap = new Map(allRoles.map(r => [r.code, r]));

      // Prepare batch operations
      const upsertOperations = [];

      // Update role permissions with batch processing
      for (const permissionCode in matrix) {
        const permission = permissionMap.get(permissionCode);
        if (!permission) continue;

        for (const roleCode in matrix[permissionCode]) {
          const role = roleMap.get(roleCode);
          if (!role) continue;

          const isGranted = matrix[permissionCode][roleCode];

          // Use upsert to handle both create and update
          upsertOperations.push(
            prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: permission.id
                }
              },
              update: {
                granted: isGranted
              },
              create: {
                roleId: role.id,
                permissionId: permission.id,
                granted: isGranted
              }
            })
          );
        }
      }

      // Execute batch operations
      if (upsertOperations.length > 0) {
        await prisma.$transaction(upsertOperations);
      }

      // Clear cache after update
      this.clearAllCache();
    } catch (error) {
      console.error('Update permission matrix error:', error);
      throw error;
    }
  }

  /**
   * Get all available permissions from database
   */
  static async getAllAvailablePermissions(): Promise<string[]> {
    try {
      const permissions = await prisma.permission.findMany({
        where: { isActive: true },
        select: { code: true }
      });
      return permissions.map(p => p.code);
    } catch (error) {
      console.error('Get all available permissions error:', error);
      return [];
    }
  }

  /**
   * Get all available roles from database
   */
  static async getAllAvailableRoles(): Promise<string[]> {
    try {
      const roles = await prisma.userRole.findMany({
        where: { isActive: true },
        select: { code: true }
      });
      return roles.map(r => r.code);
    } catch (error) {
      console.error('Get all available roles error:', error);
      return [];
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(check: RoleCheck): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: check.userId },
        select: { role: true }
      });

      if (!user) return false;

      return user.role === check.role;
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  static async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) return false;

      return roles.includes(user.role);
    } catch (error) {
      console.error('Any role check error:', error);
      return false;
    }
  }

  /**
   * Check if user can access project
   */
  static async canAccessProject(check: ProjectAccessCheck): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: check.userId }
      });

      if (!user) return false;

      // Check if user is project member
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          userId: check.userId,
          projectId: check.projectId
        }
      });

      if (projectMember) return true;

      // Check if user has global project access permission
      return await this.hasPermission({
        userId: check.userId,
        permission: 'projects_view'
      });
    } catch (error) {
      console.error('Project access check error:', error);
      return false;
    }
  }

  /**
   * Clear all permission caches
   */
  static clearAllCache(): void {
    permissionCache.clear();
    projectPermissionCache.clear();
    userPermissionCache.clear();
  }

  /**
   * Get user permissions as array
   */
  static async getUserPermissionsArray(userId: string): Promise<string[]> {
    const permissions = await this.getUserPermissions(userId);
    return Array.from(permissions.entries())
      .filter(([_, granted]) => granted)
      .map(([permission, _]) => permission);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      permissionCacheSize: permissionCache.size,
      projectPermissionCacheSize: projectPermissionCache.size,
      userPermissionCacheSize: userPermissionCache.size,
      cacheTTL: CACHE_TTL
    };
  }

  /**
   * Validate permission code format
   */
  static isValidPermissionCode(permissionCode: string): boolean {
    // Basic validation: should be lowercase with underscores
    return /^[a-z_]+$/.test(permissionCode);
  }

  /**
   * Get permission level (basic implementation)
   */
  static getPermissionLevel(permissionCode: string): string {
    if (permissionCode.includes('view')) return 'read';
    if (permissionCode.includes('create')) return 'write';
    if (permissionCode.includes('edit') || permissionCode.includes('update')) return 'write';
    if (permissionCode.includes('delete')) return 'delete';
    if (permissionCode.includes('manage')) return 'admin';
    return 'read';
  }

  /**
   * Get all permissions for a user (alias for getUserPermissionsArray)
   */
  static async getAllPermissions(userId: string): Promise<string[]> {
    return this.getUserPermissionsArray(userId);
  }

  /**
   * Get project-specific permissions for a user
   */
  static async getProjectPermissions(userId: string, projectId: string): Promise<string[]> {
    try {
      // Check if user is project member
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          userId,
          projectId
        }
      });

      if (!projectMember) {
        return [];
      }

      // Get user's global permissions
      const globalPermissions = await this.getUserPermissionsArray(userId);
      
      // Filter to project-related permissions
      const projectPermissions = globalPermissions.filter(permission => 
        permission.includes('project') || 
        permission.includes('task') || 
        permission.includes('issue') ||
        permission.includes('document')
      );

      return projectPermissions;
    } catch (error) {
      console.error('Get project permissions error:', error);
      return [];
    }
  }

  /**
   * Check if user can perform a specific action
   */
  static async canPerformAction(userId: string, action: string, resourceId?: string): Promise<boolean> {
    return this.hasPermission({
      userId,
      permission: action,
      resourceId
    });
  }
}

// Middleware helper functions
export const requirePermission = (permission: string, options?: {
  projectId?: string;
  resourceType?: string;
  action?: string;
}) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Validate permission code format
      if (!PermissionUtils.isValidPermissionCode(permission)) {
        console.warn(`Invalid permission code format: ${permission}`);
      }

      const hasPermission = await PermissionUtils.hasPermission({
        userId: req.user.id,
        permission
      });

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `Permission '${permission}' required`
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({ 
        error: 'Permission check failed',
        message: 'Internal permission validation error'
      });
    }
  };
};

export const requireProjectAccess = (action?: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const projectId = req.params.id || req.params.projectId || req.body.projectId;
      
      if (!projectId) {
        return res.status(400).json({ 
          error: 'Project ID required',
          message: 'Project ID is required for this operation'
        });
      }

      const canAccess = await PermissionUtils.canAccessProject({
        userId: req.user.id,
        projectId,
        requiredRole: action
      });

      if (!canAccess) {
        return res.status(403).json({ 
          error: 'Project access denied',
          message: 'You do not have access to this project'
        });
      }

      next();
    } catch (error) {
      console.error('Project access middleware error:', error);
      return res.status(500).json({ 
        error: 'Project access check failed',
        message: 'Internal project access validation error'
      });
    }
  };
};

export const requireResourceOwnership = (resourceType: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const resourceId = req.params.id || req.params[`${resourceType}Id`];
      
      if (!resourceId) {
        return res.status(400).json({ 
          error: 'Resource ID required',
          message: `${resourceType} ID is required`
        });
      }

      // Check if user has admin permissions from database
      const userPermissions = await PermissionUtils.getUserPermissions(req.user.id);
      if (userPermissions.has('admin_access')) {
        return next();
      }

      // Check resource ownership
      try {
        const resource = await (prisma as any)[resourceType].findFirst({
          where: {
            id: resourceId,
            createdById: req.user.id
          }
        });

        if (!resource) {
          return res.status(403).json({ 
            error: 'Access denied',
            message: `You do not have access to this ${resourceType}`
          });
        }
      } catch (error) {
        console.error(`Error checking resource ownership for ${resourceType}:`, error);
        return res.status(500).json({ 
          error: 'Resource ownership check failed',
          message: 'Internal resource ownership validation error'
        });
      }

      next();
    } catch (error) {
      console.error('Resource ownership middleware error:', error);
      return res.status(500).json({ 
        error: 'Resource ownership check failed',
        message: 'Internal resource ownership validation error'
      });
    }
  };
};

export default PermissionUtils;
