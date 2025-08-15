// Role constants for consistent usage across the application
export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  BIM_MANAGER: 'BIM_MANAGER',
  CONTRIBUTOR: 'CONTRIBUTOR',
  VIEWER: 'VIEWER',
  USER: 'USER'
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

// Role display information with consistent colors and labels
export const ROLE_INFO = {
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    name: 'Administrator',
    nameVi: 'Quản trị viên',
    color: '#ff4d4f',
    description: 'Full system access'
  },
  [ROLES.PROJECT_MANAGER]: {
    id: ROLES.PROJECT_MANAGER,
    name: 'Project Manager',
    nameVi: 'Quản lý dự án',
    color: '#1890ff',
    description: 'Project management access'
  },
  [ROLES.BIM_MANAGER]: {
    id: ROLES.BIM_MANAGER,
    name: 'BIM Manager',
    nameVi: 'Quản lý BIM',
    color: '#722ed1',
    description: 'BIM management access'
  },
  [ROLES.CONTRIBUTOR]: {
    id: ROLES.CONTRIBUTOR,
    name: 'Contributor',
    nameVi: 'Cộng tác viên',
    color: '#52c41a',
    description: 'Contribution access'
  },
  [ROLES.VIEWER]: {
    id: ROLES.VIEWER,
    name: 'Viewer',
    nameVi: 'Người xem',
    color: '#faad14',
    description: 'Read-only access'
  },
  [ROLES.USER]: {
    id: ROLES.USER,
    name: 'User',
    nameVi: 'Người dùng',
    color: '#8c8c8c',
    description: 'Basic user access'
  }
} as const;

// Helper functions
export const getRoleInfo = (role: string) => {
  return ROLE_INFO[role as RoleType] || ROLE_INFO[ROLES.USER];
};

export const getRoleDisplayName = (role: string, language: 'en' | 'vi' = 'vi') => {
  const roleInfo = getRoleInfo(role);
  return language === 'vi' ? roleInfo.nameVi : roleInfo.name;
};

export const getRoleColor = (role: string) => {
  return getRoleInfo(role).color;
};

export const getAllRoles = () => {
  return Object.values(ROLE_INFO);
};

export const getRoleOptions = (language: 'en' | 'vi' = 'vi') => {
  return getAllRoles().map(role => ({
    value: role.id,
    label: language === 'vi' ? role.nameVi : role.name,
    color: role.color
  }));
};

// Role hierarchy (for permission inheritance)
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 5,
  [ROLES.PROJECT_MANAGER]: 4,
  [ROLES.BIM_MANAGER]: 3,
  [ROLES.CONTRIBUTOR]: 2,
  [ROLES.VIEWER]: 1,
  [ROLES.USER]: 0
} as const;

export const hasHigherRole = (userRole: string, requiredRole: string) => {
  const userLevel = ROLE_HIERARCHY[userRole as RoleType] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole as RoleType] ?? -1;
  return userLevel >= requiredLevel;
};

// Get roles for permission matrix (exclude ADMIN)
export const getPermissionMatrixRoles = () => {
  return getAllRoles().filter(role => role.id !== ROLES.ADMIN);
};

// Get role options for permission matrix (exclude ADMIN)
export const getPermissionMatrixRoleOptions = (language: 'en' | 'vi' = 'vi') => {
  return getPermissionMatrixRoles().map(role => ({
    value: role.id,
    label: language === 'vi' ? role.nameVi : role.name,
    color: role.color
  }));
};
