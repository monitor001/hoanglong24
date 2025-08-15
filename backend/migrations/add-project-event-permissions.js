const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding project event permissions...');

  // Get current permission matrix
  const currentMatrix = await prisma.systemSetting.findUnique({
    where: { key: 'role_permission_matrix' }
  });

  let permissionMatrix = {};
  
  if (currentMatrix) {
    permissionMatrix = JSON.parse(currentMatrix.value);
  }

  // Add new project event permissions
  const newPermissions = {
    // Dashboard permissions
    'dashboard_print': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'dashboard_download': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    
    // Project permissions - Detailed events
    'view_project_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'export_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_project_members': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'upload_project_images': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'add_project_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_project_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'edit_project_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_project_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'share_project_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'filter_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'search_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'view_project_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'export_project_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'import_project_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'archive_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'restore_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'duplicate_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'assign_project_roles': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_project_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'approve_project_changes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Document permissions
    'upload_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'download_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'share_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'approve_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'version_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Task permissions
    'assign_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'complete_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'approve_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Issue permissions
    'resolve_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'assign_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'approve_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Calendar permissions
    'share_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'export_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Approval permissions
    'reject_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delegate_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // User management permissions
    'assign_user_roles': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_user_activity': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'reset_user_password': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Settings permissions
    'manage_permissions': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_audit_logs': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'import_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'reset_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Report permissions
    'schedule_reports': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'share_reports': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delete_reports': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Notes permissions
    'export_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Checklist permissions
    'complete_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'export_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false }
  };

  // Merge new permissions with existing ones
  const updatedMatrix = { ...permissionMatrix, ...newPermissions };

  // Update the permission matrix
  if (currentMatrix) {
    await prisma.systemSetting.update({
      where: { key: 'role_permission_matrix' },
      data: {
        value: JSON.stringify(updatedMatrix),
        updatedAt: new Date()
      }
    });
  } else {
    await prisma.systemSetting.create({
      data: {
        key: 'role_permission_matrix',
        value: JSON.stringify(updatedMatrix),
        description: 'Role-based permission matrix with project event permissions',
        category: 'permissions',
        isActive: true
      }
    });
  }

  console.log('Project event permissions added successfully!');
  console.log('Total permissions:', Object.keys(updatedMatrix).length);
}

main()
  .catch((e) => {
    console.error('Error adding project event permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
