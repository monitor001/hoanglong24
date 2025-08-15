const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default permission matrix...');

  // Check if permission matrix already exists
  const existingMatrix = await prisma.systemSetting.findUnique({
    where: { key: 'role_permission_matrix' }
  });

  if (existingMatrix) {
    console.log('Permission matrix already exists, skipping...');
    return;
  }

  // Default permission matrix
  const defaultMatrix = {
    // Dashboard permissions
    'dashboard_view': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'dashboard_export': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Project permissions
    'view_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delete_projects': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Document permissions
    'view_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Task permissions
    'view_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Issue permissions
    'view_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Calendar permissions
    'view_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Approval permissions
    'view_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'create_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'approve_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // User management permissions
    'view_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'create_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delete_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Settings permissions
    'view_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Report permissions
    'view_reports': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'create_reports': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_reports': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    
    // Notes permissions
    'view_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'share_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    
    // Checklist permissions
    'view_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delete_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'approve_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false }
  };

  // Create permission matrix
  await prisma.systemSetting.create({
    data: {
      key: 'role_permission_matrix',
      value: JSON.stringify(defaultMatrix),
      description: 'Default role-based permission matrix',
      category: 'permissions',
      isActive: true
    }
  });

  console.log('Default permission matrix seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding default permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
