// Simple Permission System for Frontend
// Đơn giản hóa hệ thống phân quyền để tập trung phát triển tính năng chính

/**
 * Simple permission check - chỉ kiểm tra role cơ bản
 */
export const hasPermission = (userRole: string, permission: string): boolean => {
  // Admin có tất cả quyền
  if (userRole === 'ADMIN') {
    return true;
  }

  // Các role khác có quyền cơ bản
  const basicPermissions = [
    'dashboard_view',
    'project_view',
    'task_view',
    'document_view',
    'user_view'
  ];

  return basicPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (userRole: string, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if user has all specified permissions
 */
export const hasAllPermissions = (userRole: string, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a user role
 */
export const getUserPermissions = (userRole: string): string[] => {
  if (userRole === 'ADMIN') {
    return ['*']; // Admin có tất cả quyền
  }

  // Quyền cơ bản cho các role khác
  return [
    'dashboard_view',
    'project_view',
    'task_view',
    'document_view',
    'user_view',
    'project_create',
    'task_create',
    'document_create'
  ];
};

/**
 * Check if user can perform action on resource
 */
export const canPerformAction = (userRole: string, resource: string, action: string): boolean => {
  const permission = `${resource}_${action}`;
  return hasPermission(userRole, permission);
};

/**
 * Simple role-based access control
 */
export const requireRole = (allowedRoles: string[]) => {
  return (userRole: string): boolean => {
    return allowedRoles.includes(userRole);
  };
};

/**
 * Admin only check
 */
export const requireAdmin = (userRole: string): boolean => {
  return userRole === 'ADMIN';
};

/**
 * Project member check (simplified)
 */
export const isProjectMember = (userRole: string): boolean => {
  return ['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'].includes(userRole);
};

/**
 * Project manager check
 */
export const isProjectManager = (userRole: string): boolean => {
  return ['ADMIN', 'MANAGER'].includes(userRole);
};

// Export for backward compatibility
export const PermissionUtils = {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  canPerformAction,
  requireRole,
  requireAdmin,
  isProjectMember,
  isProjectManager
};
