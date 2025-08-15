import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
  
  // Admin Access
  ADMIN_ACCESS: 'admin_access',
  
  // Project Management
  PROJECT_VIEW: 'view_projects',
  PROJECT_CREATE: 'create_projects',
  PROJECT_EDIT: 'edit_projects',
  PROJECT_DELETE: 'delete_projects',
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
  TASK_VIEW: 'view_tasks',
  TASK_CREATE: 'create_tasks',
  TASK_EDIT: 'edit_tasks',
  TASK_DELETE: 'delete_tasks',
  TASK_ASSIGN: 'task_assign',
  TASK_APPROVE: 'task_approve',
  
  // Document Management
  DOCUMENT_VIEW: 'view_documents',
  DOCUMENT_UPLOAD: 'upload_documents',
  DOCUMENT_EDIT: 'edit_documents',
  DOCUMENT_DELETE: 'delete_documents',
  DOCUMENT_APPROVE: 'document_approve',
  DOCUMENT_DOWNLOAD: 'document_download',
  
  // User Management
  USER_VIEW: 'view_users',
  USER_CREATE: 'create_users',
  USER_EDIT: 'edit_users',
  USER_DELETE: 'delete_users',
  USER_MANAGE_ROLES: 'user_manage_roles',
  
  // Report Management
  REPORT_VIEW: 'view_reports',
  REPORT_CREATE: 'create_reports',
  REPORT_EDIT: 'edit_reports',
  REPORT_DELETE: 'delete_reports',
  REPORT_EXPORT: 'export_reports',
  
  // Checklist Management
  CHECKLIST_VIEW: 'view_design_checklist',
  CHECKLIST_CREATE: 'create_design_checklist',
  CHECKLIST_EDIT: 'edit_design_checklist',
  CHECKLIST_DELETE: 'delete_design_checklist',
  CHECKLIST_APPROVE: 'approve_design_checklist',
  
  // System Admin
  SYSTEM_SETTINGS: 'view_settings',
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_LOGS: 'system_logs',
  
  // Issues Management
  ISSUE_VIEW: 'view_issues',
  ISSUE_CREATE: 'create_issues',
  ISSUE_EDIT: 'edit_issues',
  ISSUE_DELETE: 'delete_issues',
  
  // Notes Management
  NOTE_VIEW: 'view_notes',
  NOTE_CREATE: 'create_notes',
  NOTE_EDIT: 'edit_notes',
  NOTE_DELETE: 'delete_notes',
  
  // Calendar Management
  CALENDAR_VIEW: 'view_calendar',
  CALENDAR_CREATE: 'create_events',
  CALENDAR_EDIT: 'edit_events',
  CALENDAR_DELETE: 'delete_events',
  
  // Approval Management
  APPROVAL_VIEW: 'view_approvals',
  APPROVAL_CREATE: 'create_approvals',
  APPROVAL_EDIT: 'edit_approvals',
  APPROVAL_APPROVE: 'approve_documents',
  APPROVAL_REJECT: 'reject_documents',
  
  // Todo Management
  TODO_VIEW: 'view_todo',
  TODO_CREATE: 'create_todo',
  TODO_EDIT: 'edit_todo',
  TODO_DELETE: 'delete_todo',
  TODO_COMPLETE: 'complete_todo'
} as const;

// Role-based Permission Matrix (same as backend)
export const ROLE_PERMISSIONS = {
  ADMIN: {
    permissions: Object.values(PERMISSION_CODES),
    description: 'Full system access'
  },
  PROJECT_MANAGER: {
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
      
      // Issues Management - Full access
      PERMISSION_CODES.ISSUE_VIEW,
      PERMISSION_CODES.ISSUE_CREATE,
      PERMISSION_CODES.ISSUE_EDIT,
      PERMISSION_CODES.ISSUE_DELETE,
      
      // Notes Management - Full access
      PERMISSION_CODES.NOTE_VIEW,
      PERMISSION_CODES.NOTE_CREATE,
      PERMISSION_CODES.NOTE_EDIT,
      PERMISSION_CODES.NOTE_DELETE,
      
      // Calendar Management - Full access
      PERMISSION_CODES.CALENDAR_VIEW,
      PERMISSION_CODES.CALENDAR_CREATE,
      PERMISSION_CODES.CALENDAR_EDIT,
      PERMISSION_CODES.CALENDAR_DELETE,
      
      // Approval Management - Full access
      PERMISSION_CODES.APPROVAL_VIEW,
      PERMISSION_CODES.APPROVAL_CREATE,
      PERMISSION_CODES.APPROVAL_EDIT,
      PERMISSION_CODES.APPROVAL_APPROVE,
      PERMISSION_CODES.APPROVAL_REJECT,
      
      // Todo Management - Full access
      PERMISSION_CODES.TODO_VIEW,
      PERMISSION_CODES.TODO_CREATE,
      PERMISSION_CODES.TODO_EDIT,
      PERMISSION_CODES.TODO_DELETE,
      PERMISSION_CODES.TODO_COMPLETE,
      
      // Checklist Management - Full access
      PERMISSION_CODES.CHECKLIST_VIEW,
      PERMISSION_CODES.CHECKLIST_CREATE,
      PERMISSION_CODES.CHECKLIST_EDIT,
      PERMISSION_CODES.CHECKLIST_DELETE,
      PERMISSION_CODES.CHECKLIST_APPROVE,
      
      // Report Management - Full access
      PERMISSION_CODES.REPORT_VIEW,
      PERMISSION_CODES.REPORT_CREATE,
      PERMISSION_CODES.REPORT_EDIT,
      PERMISSION_CODES.REPORT_DELETE,
      PERMISSION_CODES.REPORT_EXPORT,
      
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
      PERMISSION_CODES.DOCUMENT_DOWNLOAD,
      
      // Issues Management - View and edit
      PERMISSION_CODES.ISSUE_VIEW,
      PERMISSION_CODES.ISSUE_CREATE,
      PERMISSION_CODES.ISSUE_EDIT,
      
      // Notes Management - View and edit
      PERMISSION_CODES.NOTE_VIEW,
      PERMISSION_CODES.NOTE_CREATE,
      PERMISSION_CODES.NOTE_EDIT,
      
      // Calendar Management - View and edit
      PERMISSION_CODES.CALENDAR_VIEW,
      PERMISSION_CODES.CALENDAR_CREATE,
      PERMISSION_CODES.CALENDAR_EDIT,
      
      // Todo Management - Full access
      PERMISSION_CODES.TODO_VIEW,
      PERMISSION_CODES.TODO_CREATE,
      PERMISSION_CODES.TODO_EDIT,
      PERMISSION_CODES.TODO_DELETE,
      PERMISSION_CODES.TODO_COMPLETE,
      
      // Checklist Management - View and edit
      PERMISSION_CODES.CHECKLIST_VIEW,
      PERMISSION_CODES.CHECKLIST_CREATE,
      PERMISSION_CODES.CHECKLIST_EDIT,
      PERMISSION_CODES.CHECKLIST_APPROVE
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
      PERMISSION_CODES.DOCUMENT_DOWNLOAD,
      
      // Issues Management - View and create
      PERMISSION_CODES.ISSUE_VIEW,
      PERMISSION_CODES.ISSUE_CREATE,
      
      // Notes Management - View and create
      PERMISSION_CODES.NOTE_VIEW,
      PERMISSION_CODES.NOTE_CREATE,
      
      // Calendar Management - View only
      PERMISSION_CODES.CALENDAR_VIEW,
      
      // Todo Management - View and edit own todos
      PERMISSION_CODES.TODO_VIEW,
      PERMISSION_CODES.TODO_CREATE,
      PERMISSION_CODES.TODO_EDIT,
      PERMISSION_CODES.TODO_COMPLETE,
      
      // Checklist Management - View only
      PERMISSION_CODES.CHECKLIST_VIEW
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
      PERMISSION_CODES.DOCUMENT_VIEW,
      
      // Issues Management - View only
      PERMISSION_CODES.ISSUE_VIEW,
      
      // Notes Management - View only
      PERMISSION_CODES.NOTE_VIEW,
      
      // Calendar Management - View only
      PERMISSION_CODES.CALENDAR_VIEW,
      
      // Todo Management - View only
      PERMISSION_CODES.TODO_VIEW,
      
      // Checklist Management - View only
      PERMISSION_CODES.CHECKLIST_VIEW
    ],
    description: 'Read-only access to projects'
  }
} as const;

// Cache for permission checks
const permissionCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Optimized permission utilities for frontend
 */
export class FrontendPermissionUtils {
  /**
   * Check if user has specific permission
   */
  static hasPermission(userRole: string, permission: string): boolean {
    try {
      const cacheKey = `${userRole}:${permission}`;
      
      // Check cache first
      const cached = permissionCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }

      // Get role permissions
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
      console.error('Frontend permission check error:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user role
   */
  static getUserPermissions(userRole: string): string[] {
    try {
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
  static hasAnyPermission(userRole: string, permissions: string[]): boolean {
    try {
      for (const permission of permissions) {
        if (this.hasPermission(userRole, permission)) {
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
  static hasAllPermissions(userRole: string, permissions: string[]): boolean {
    try {
      for (const permission of permissions) {
        if (!this.hasPermission(userRole, permission)) {
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
   * Clear permission cache
   */
  static clearCache(): void {
    permissionCache.clear();
  }

  /**
   * Get role description
   */
  static getRoleDescription(role: string): string {
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
    return rolePermissions ? rolePermissions.description : 'Unknown role';
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

/**
 * React hook for optimized permission checking
 */
export const useOptimizedPermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role || 'USER';

  return {
    /**
     * Check if current user has specific permission
     */
    hasPermission: (permission: string): boolean => {
      return FrontendPermissionUtils.hasPermission(userRole, permission);
    },

    /**
     * Check if current user has any permission from a list
     */
    hasAnyPermission: (permissions: string[]): boolean => {
      return FrontendPermissionUtils.hasAnyPermission(userRole, permissions);
    },

    /**
     * Check if current user has all permissions from a list
     */
    hasAllPermissions: (permissions: string[]): boolean => {
      return FrontendPermissionUtils.hasAllPermissions(userRole, permissions);
    },

    /**
     * Get all permissions for current user
     */
    getUserPermissions: (): string[] => {
      return FrontendPermissionUtils.getUserPermissions(userRole);
    },

    /**
     * Check if current user is admin
     */
    isAdmin: (): boolean => {
      return userRole === 'ADMIN';
    },

    /**
     * Check if current user is project manager
     */
    isProjectManager: (): boolean => {
      return userRole === 'PROJECT_MANAGER';
    },

    /**
     * Check if current user is BIM manager
     */
    isBimManager: (): boolean => {
      return userRole === 'BIM_MANAGER';
    },

    /**
     * Check if current user is contributor
     */
    isContributor: (): boolean => {
      return userRole === 'CONTRIBUTOR';
    },

    /**
     * Check if current user is viewer
     */
    isViewer: (): boolean => {
      return userRole === 'VIEWER';
    },

    /**
     * Get current user role
     */
    getUserRole: (): string => {
      return userRole;
    },

    /**
     * Get role description
     */
    getRoleDescription: (): string => {
      return FrontendPermissionUtils.getRoleDescription(userRole);
    },

    /**
     * Check if permission is restricted for current user role
     */
    isPermissionRestricted: (permission: string): boolean => {
      if (userRole === 'PROJECT_MANAGER') {
        return FrontendPermissionUtils.isRestrictedForProjectManager(permission);
      }
      return false;
    }
  };
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = (permission: string) => {
  return (Component: React.ComponentType<any>) => {
    return (props: any) => {
      const { hasPermission } = useOptimizedPermissions();
      
      if (!hasPermission(permission)) {
        return null;
      }
      
      return <Component {...props} />;
    };
  };
};

/**
 * Permission-based conditional rendering component
 */
export const PermissionGuard: React.FC<{
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useOptimizedPermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * Multiple permissions guard
 */
export const MultiPermissionGuard: React.FC<{
  permissions: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permissions, requireAll = false, children, fallback = null }) => {
  const { hasAnyPermission, hasAllPermissions } = useOptimizedPermissions();
  
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
