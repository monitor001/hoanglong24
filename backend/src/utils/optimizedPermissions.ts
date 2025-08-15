import { prisma } from '../db';

// Permission Categories
export const PERMISSION_CATEGORIES = {
  PROJECT_MANAGEMENT: 'project_management',
  TASK_MANAGEMENT: 'task_management',
  DOCUMENT_MANAGEMENT: 'document_management',
  USER_MANAGEMENT: 'user_management',
  REPORT_MANAGEMENT: 'report_management',
  CHECKLIST_MANAGEMENT: 'checklist_management',
  SYSTEM_ADMIN: 'system_admin'
} as const;

// Permission Codes
export const PERMISSION_CODES = {
  // Dashboard Management
  DASHBOARD_VIEW: 'dashboard_view',
  DASHBOARD_EXPORT: 'dashboard_export',
  DASHBOARD_PRINT: 'dashboard_print',
  DASHBOARD_DOWNLOAD: 'dashboard_download',
  
  // Project Management
  PROJECT_VIEW: 'project_view',
  PROJECT_CREATE: 'project_create',
  PROJECT_EDIT: 'project_edit',
  PROJECT_DELETE: 'project_delete',
  PROJECT_MANAGE_MEMBERS: 'project_manage_members',
  PROJECT_ASSIGN_ROLES: 'project_assign_roles',
  PROJECT_MANAGE_PERMISSIONS: 'project_manage_permissions',
  PROJECT_VIEW_NOTES: 'project_view_notes',
  PROJECT_ADD_NOTES: 'project_add_notes',
  PROJECT_EDIT_NOTES: 'project_edit_notes',
  PROJECT_DELETE_NOTES: 'project_delete_notes',
  PROJECT_UPLOAD_IMAGES: 'project_upload_images',
  PROJECT_VIEW_STATISTICS: 'project_view_statistics',
  PROJECT_EXPORT: 'project_export',
  PROJECT_SHARE: 'project_share',
  
  // Task Management
  TASK_VIEW: 'task_view',
  TASK_CREATE: 'task_create',
  TASK_EDIT: 'task_edit',
  TASK_DELETE: 'task_delete',
  TASK_ASSIGN: 'task_assign',
  TASK_APPROVE: 'task_approve',
  
  // Document Management
  DOCUMENT_VIEW: 'document_view',
  DOCUMENT_UPLOAD: 'document_upload',
  DOCUMENT_EDIT: 'document_edit',
  DOCUMENT_DELETE: 'document_delete',
  DOCUMENT_APPROVE: 'document_approve',
  DOCUMENT_DOWNLOAD: 'document_download',
  
  // User Management
  USER_VIEW: 'user_view',
  USER_CREATE: 'user_create',
  USER_EDIT: 'user_edit',
  USER_DELETE: 'user_delete',
  USER_MANAGE_ROLES: 'user_manage_roles',
  
  // Report Management
  REPORT_VIEW: 'report_view',
  REPORT_CREATE: 'report_create',
  REPORT_EDIT: 'report_edit',
  REPORT_DELETE: 'report_delete',
  REPORT_EXPORT: 'report_export',
  
  // Checklist Management
  CHECKLIST_VIEW: 'checklist_view',
  CHECKLIST_CREATE: 'checklist_create',
  CHECKLIST_EDIT: 'checklist_edit',
  CHECKLIST_DELETE: 'checklist_delete',
  CHECKLIST_APPROVE: 'checklist_approve',
  
  // System Admin
  SYSTEM_SETTINGS: 'system_settings',
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_LOGS: 'system_logs'
} as const;

// Role-based Permission Matrix
export const ROLE_PERMISSIONS = {
  ADMIN: {
    // Admin has all permissions
    permissions: Object.values(PERMISSION_CODES),
    description: 'Full system access'
  },
  PROJECT_MANAGER: {
    // Project Manager has all permissions except restricted ones
    permissions: [
      // Dashboard Management - Full access
      PERMISSION_CODES.DASHBOARD_VIEW,
      PERMISSION_CODES.DASHBOARD_EXPORT,
      PERMISSION_CODES.DASHBOARD_PRINT,
      PERMISSION_CODES.DASHBOARD_DOWNLOAD,
      
      // Project Management - Full access
      PERMISSION_CODES.PROJECT_VIEW,
      PERMISSION_CODES.PROJECT_CREATE,
      PERMISSION_CODES.PROJECT_EDIT,
      PERMISSION_CODES.PROJECT_DELETE,
      PERMISSION_CODES.PROJECT_MANAGE_MEMBERS,
      PERMISSION_CODES.PROJECT_ASSIGN_ROLES,
      PERMISSION_CODES.PROJECT_MANAGE_PERMISSIONS,
      PERMISSION_CODES.PROJECT_VIEW_NOTES,
      PERMISSION_CODES.PROJECT_ADD_NOTES,
      PERMISSION_CODES.PROJECT_EDIT_NOTES,
      PERMISSION_CODES.PROJECT_DELETE_NOTES,
      PERMISSION_CODES.PROJECT_UPLOAD_IMAGES,
      PERMISSION_CODES.PROJECT_VIEW_STATISTICS,
      PERMISSION_CODES.PROJECT_EXPORT,
      PERMISSION_CODES.PROJECT_SHARE,
      
      // Task Management - Full access
      PERMISSION_CODES.TASK_VIEW,
      PERMISSION_CODES.TASK_CREATE,
      PERMISSION_CODES.TASK_EDIT,
      PERMISSION_CODES.TASK_DELETE,
      PERMISSION_CODES.TASK_ASSIGN,
      PERMISSION_CODES.TASK_APPROVE,
      
      // Document Management - Limited access (no upload/delete)
      PERMISSION_CODES.DOCUMENT_VIEW,
      PERMISSION_CODES.DOCUMENT_DOWNLOAD,
      
      // System Admin - Limited access
      PERMISSION_CODES.SYSTEM_LOGS
    ],
    description: 'Project management with limited system access'
  },
  BIM_MANAGER: {
    permissions: [
      // Dashboard Management - Basic access
      PERMISSION_CODES.DASHBOARD_VIEW,
      PERMISSION_CODES.DASHBOARD_PRINT,
      
      // Project Management - View and edit
      PERMISSION_CODES.PROJECT_VIEW,
      PERMISSION_CODES.PROJECT_EDIT,
      
      // Task Management - Full access
      PERMISSION_CODES.TASK_VIEW,
      PERMISSION_CODES.TASK_CREATE,
      PERMISSION_CODES.TASK_EDIT,
      PERMISSION_CODES.TASK_ASSIGN,
      PERMISSION_CODES.TASK_APPROVE,
      
      // Document Management - View and download
      PERMISSION_CODES.DOCUMENT_VIEW,
      PERMISSION_CODES.DOCUMENT_DOWNLOAD
    ],
    description: 'BIM management with task and document access'
  },
  CONTRIBUTOR: {
    permissions: [
      // Dashboard Management - Basic access
      PERMISSION_CODES.DASHBOARD_VIEW,
      
      // Project Management - View only
      PERMISSION_CODES.PROJECT_VIEW,
      
      // Task Management - View and edit assigned tasks
      PERMISSION_CODES.TASK_VIEW,
      PERMISSION_CODES.TASK_EDIT,
      
      // Document Management - View and download
      PERMISSION_CODES.DOCUMENT_VIEW,
      PERMISSION_CODES.DOCUMENT_DOWNLOAD
    ],
    description: 'Contributor with limited project access'
  },
  VIEWER: {
    permissions: [
      // Dashboard Management - Basic access
      PERMISSION_CODES.DASHBOARD_VIEW,
      
      // Project Management - View only
      PERMISSION_CODES.PROJECT_VIEW,
      
      // Task Management - View only
      PERMISSION_CODES.TASK_VIEW,
      
      // Document Management - View only
      PERMISSION_CODES.DOCUMENT_VIEW
    ],
    description: 'Read-only access to projects'
  }
} as const;

// Cache for optimized permission checks
const permissionCache = new Map<string, { result: boolean; timestamp: number }>();
const userRoleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export class OptimizedPermissionUtils {
  /**
   * Get user role with caching
   */
  static async getUserRole(userId: string): Promise<string> {
    try {
      // Check cache first
      const cached = userRoleCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.role;
      }

      // Get user role from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) return 'USER';

      // Cache the result
      userRoleCache.set(userId, { role: user.role, timestamp: Date.now() });
      return user.role;
    } catch (error) {
      console.error('Get user role error:', error);
      return 'USER';
    }
  }

  /**
   * Check if user has specific permission with optimized caching
   */
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const cacheKey = `${userId}:${permission}`;
      
      // Check cache first
      const cached = permissionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }

      // Get user role
      const userRole = await this.getUserRole(userId);
      
      // Check if role exists in permission matrix
      const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
      if (!rolePermissions) {
        return false;
      }

      // Check if permission is granted for this role
      const hasPermission = rolePermissions.permissions.includes(permission as any);

      // Cache the result
      permissionCache.set(cacheKey, { result: hasPermission, timestamp: Date.now() });
      return hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const userRole = await this.getUserRole(userId);
      const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
      
      return rolePermissions ? [...rolePermissions.permissions] : [];
    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  /**
   * Check if user has any permission from a list
   */
  static async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    try {
      for (const permission of permissions) {
        if (await this.hasPermission(userId, permission)) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Has any permission error:', error);
      return false;
    }
  }

  /**
   * Check if user has all permissions from a list
   */
  static async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    try {
      for (const permission of permissions) {
        if (!(await this.hasPermission(userId, permission))) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Has all permissions error:', error);
      return false;
    }
  }

  /**
   * Clear cache for a specific user
   */
  static clearUserCache(userId: string): void {
    // Clear permission cache for this user
    for (const key of permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        permissionCache.delete(key);
      }
    }
    
    // Clear role cache
    userRoleCache.delete(userId);
  }

  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    permissionCache.clear();
    userRoleCache.clear();
  }

  /**
   * Get role description
   */
  static getRoleDescription(role: string): string {
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
    return rolePermissions ? rolePermissions.description : 'Unknown role';
  }

  /**
   * Get all available roles
   */
  static getAvailableRoles(): string[] {
    return Object.keys(ROLE_PERMISSIONS);
  }

  /**
   * Check if permission is restricted for Project Manager
   */
  static isRestrictedForProjectManager(permission: string): boolean {
    const restrictedPermissions = [
      // User Management
      PERMISSION_CODES.USER_VIEW,
      PERMISSION_CODES.USER_CREATE,
      PERMISSION_CODES.USER_EDIT,
      PERMISSION_CODES.USER_DELETE,
      PERMISSION_CODES.USER_MANAGE_ROLES,
      
      // Report Management
      PERMISSION_CODES.REPORT_VIEW,
      PERMISSION_CODES.REPORT_CREATE,
      PERMISSION_CODES.REPORT_EDIT,
      PERMISSION_CODES.REPORT_DELETE,
      PERMISSION_CODES.REPORT_EXPORT,
      
      // Checklist Management
      PERMISSION_CODES.CHECKLIST_VIEW,
      PERMISSION_CODES.CHECKLIST_CREATE,
      PERMISSION_CODES.CHECKLIST_EDIT,
      PERMISSION_CODES.CHECKLIST_DELETE,
      PERMISSION_CODES.CHECKLIST_APPROVE,
      
      // Document Management (restricted)
      PERMISSION_CODES.DOCUMENT_UPLOAD,
      PERMISSION_CODES.DOCUMENT_EDIT,
      PERMISSION_CODES.DOCUMENT_DELETE,
      PERMISSION_CODES.DOCUMENT_APPROVE,
      
      // System Admin
      PERMISSION_CODES.SYSTEM_SETTINGS,
      PERMISSION_CODES.SYSTEM_BACKUP
    ];
    
    return restrictedPermissions.includes(permission as any);
  }
}