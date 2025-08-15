import { isProjectManagerRole, isProjectOwnerRole, isAdminRole } from '../constants/permissions';

// Project utility functions
export const findProjectManager = (members: any[] = []) => {
  return members.find(member => isProjectManagerRole(member.role));
};

export const findProjectOwner = (members: any[] = []) => {
  return members.find(member => isProjectOwnerRole(member.role));
};

export const canManageProject = (userRole: string, projectMembers: any[] = [], userId?: string) => {
  // Admin can manage all projects
  if (isAdminRole(userRole)) {
    return true;
  }

  // Project managers can manage projects they're assigned to
  if (isProjectManagerRole(userRole)) {
    return projectMembers.some(member => 
      member.userId === userId && isProjectManagerRole(member.role)
    );
  }

  return false;
};

export const canEditProject = (userRole: string, projectMembers: any[] = [], userId?: string) => {
  // Admin can edit all projects
  if (isAdminRole(userRole)) {
    return true;
  }

  // Project owners and managers can edit projects they're assigned to
  if (isProjectOwnerRole(userRole)) {
    return projectMembers.some(member => 
      member.userId === userId && isProjectOwnerRole(member.role)
    );
  }

  return false;
};

export const canDeleteProject = (userRole: string, projectMembers: any[] = [], userId?: string) => {
  // Only admin and project owners can delete projects
  if (isAdminRole(userRole)) {
    return true;
  }

  if (isProjectOwnerRole(userRole)) {
    return projectMembers.some(member => 
      member.userId === userId && isProjectOwnerRole(member.role)
    );
  }

  return false;
};

export const canManageProjectMembers = (userRole: string, projectMembers: any[] = [], userId?: string) => {
  // Admin can manage all project members
  if (isAdminRole(userRole)) {
    return true;
  }

  // Project managers can manage members of projects they're assigned to
  if (isProjectManagerRole(userRole)) {
    return projectMembers.some(member => 
      member.userId === userId && isProjectManagerRole(member.role)
    );
  }

  return false;
};

// Get project manager name
export const getProjectManagerName = (members: any[] = []) => {
  const manager = findProjectManager(members);
  return manager?.user?.name || 'Chưa phân công';
};

// Get project owner name
export const getProjectOwnerName = (members: any[] = []) => {
  const owner = findProjectOwner(members);
  return owner?.user?.name || 'Chưa phân công';
};
