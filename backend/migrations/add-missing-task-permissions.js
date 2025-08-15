const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingTaskPermissions() {
  console.log('🌱 Adding missing task permissions to database...');

  try {
    // Get existing permission matrix
    const existingMatrix = await prisma.systemSetting.findUnique({
      where: { key: 'role_permission_matrix' }
    });

    if (!existingMatrix) {
      console.log('❌ No existing permission matrix found');
      return;
    }

    let currentMatrix = JSON.parse(existingMatrix.value);

    // Define missing task permissions with role-based access
    const missingTaskPermissions = {
      // Task advanced permissions
      'assign_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'complete_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'approve_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'comment_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'view_task_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      
      // Task export/import permissions
      'export_task_table': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'export_task_gantt': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'export_task_pdf': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'export_task_excel': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'import_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
      // Task management permissions
      'filter_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'search_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'sort_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'view_task_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'manage_task_categories': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
      // Task special permissions
      'view_overdue_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'view_upcoming_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'change_task_status': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'change_task_priority': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'attach_documents_to_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      
      // Task detail permissions
      'view_task_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'view_task_progress': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'manage_task_priorities': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
      // Task bulk operations
      'bulk_manage_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'manage_task_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'restore_deleted_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false }
    };

    // Add missing permissions to matrix
    let addedCount = 0;
    for (const [permission, roles] of Object.entries(missingTaskPermissions)) {
      if (!currentMatrix[permission]) {
        currentMatrix[permission] = roles;
        addedCount++;
        console.log(`✅ Added permission: ${permission}`);
      } else {
        console.log(`⚠️  Permission already exists: ${permission}`);
      }
    }

    // Update database
    await prisma.systemSetting.upsert({
      where: { key: 'role_permission_matrix' },
      update: { 
        value: JSON.stringify(currentMatrix),
        category: 'system'
      },
      create: { 
        key: 'role_permission_matrix', 
        value: JSON.stringify(currentMatrix),
        category: 'system',
        description: 'Role-based permission matrix for the system'
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`✅ Added ${addedCount} new task permissions`);
    console.log(`📈 Total task permissions in database: ${Object.keys(currentMatrix).filter(key => key.includes('task')).length}`);

    // Verify the update
    const updatedMatrix = await prisma.systemSetting.findUnique({
      where: { key: 'role_permission_matrix' }
    });

    if (updatedMatrix) {
      const matrix = JSON.parse(updatedMatrix.value);
      const taskPermissions = Object.keys(matrix).filter(key => key.includes('task'));
      console.log(`✅ Verification: ${taskPermissions.length} task permissions found in database`);
    }

  } catch (error) {
    console.error('❌ Error adding task permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingTaskPermissions();
