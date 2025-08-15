// Permission constants for role-based access control
export const PERMISSIONS = {
  // Admin permissions
  ADMIN_ACCESS: 'admin_access',
  
  // Project management permissions
  PROJECT_MANAGER_ROLES: ['PROJECT_MANAGER', 'MANAGER', 'BIM_MANAGER'],
  PROJECT_OWNER_ROLES: ['OWNER', 'PROJECT_MANAGER', 'MANAGER', 'BIM_MANAGER'],
  
  // Task permissions
  VIEW_TASKS: 'view_tasks',
  CREATE_TASKS: 'create_tasks',
  EDIT_TASKS: 'edit_tasks',
  DELETE_TASKS: 'delete_tasks',
  
  // Issue permissions
  VIEW_ISSUES: 'view_issues',
  CREATE_ISSUES: 'create_issues',
  EDIT_ISSUES: 'edit_issues',
  DELETE_ISSUES: 'delete_issues',
  
  // Project permissions
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  MANAGE_PROJECT_MEMBERS: 'manage_project_members',
  
  // Document permissions
  VIEW_DOCUMENTS: 'view_documents',
  CREATE_DOCUMENTS: 'create_documents',
  EDIT_DOCUMENTS: 'edit_documents',
  DELETE_DOCUMENTS: 'delete_documents',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Settings permissions
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  
  // Other permissions
  VIEW_CALENDAR: 'view_calendar',
  VIEW_REPORTS: 'view_reports',
  VIEW_NOTES: 'view_notes',
  VIEW_DESIGN_CHECKLIST: 'view_design_checklist',
  VIEW_APPROVALS: 'view_approvals',
  VIEW_TODO_LIST: 'view_todo_list'
} as const;

// Role constants
export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  BIM_MANAGER: 'BIM_MANAGER',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
  CONTRIBUTOR: 'CONTRIBUTOR'
} as const;

// Utility functions for role checks
export const isProjectManagerRole = (role: string): boolean => {
  return PERMISSIONS.PROJECT_MANAGER_ROLES.includes(role as any);
};

export const isProjectOwnerRole = (role: string): boolean => {
  return PERMISSIONS.PROJECT_OWNER_ROLES.includes(role as any);
};

export const isAdminRole = (role: string): boolean => {
  return role === ROLES.ADMIN;
};

// Permission check utilities
export const hasProjectManagementPermission = (userRole: string): boolean => {
  return isAdminRole(userRole) || isProjectManagerRole(userRole);
};

export const hasProjectOwnershipPermission = (userRole: string): boolean => {
  return isAdminRole(userRole) || isProjectOwnerRole(userRole);
};
