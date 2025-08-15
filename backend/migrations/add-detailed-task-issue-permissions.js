const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding detailed task and issue permissions...');

  try {
    // Get existing permission matrix
    const existingMatrix = await prisma.systemSetting.findUnique({
      where: { key: 'role_permission_matrix' }
    });

    let currentMatrix = {};
    if (existingMatrix) {
      currentMatrix = JSON.parse(existingMatrix.value);
    }

    // Define new detailed permissions for tasks and issues
    const newTaskPermissions = {
      // Task basic permissions (already exist, but ensure they're there)
      'view_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'create_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'edit_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'delete_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
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
      'view_task_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'manage_task_categories': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
      // Task special permissions
      'view_overdue_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'view_upcoming_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'change_task_status': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'change_task_priority': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'attach_documents_to_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false }
    };

    const newIssuePermissions = {
      // Issue basic permissions (already exist, but ensure they're there)
      'view_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'create_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'edit_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'delete_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
      // Issue advanced permissions
      'assign_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'resolve_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'approve_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'comment_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'view_issue_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      
      // Issue export/import permissions
      'export_issue_table': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'export_issue_gantt': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'export_issue_pdf': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'export_issue_excel': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
      'import_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
      // Issue management permissions
      'filter_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'search_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'sort_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
      'view_issue_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'manage_issue_types': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
      
      // Issue special permissions
      'view_overdue_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'view_warning_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'change_issue_status': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'change_issue_priority': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
      'attach_documents_to_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false }
    };

    // Merge new permissions with existing matrix
    const updatedMatrix = {
      ...currentMatrix,
      ...newTaskPermissions,
      ...newIssuePermissions
    };

    // Update or create permission matrix
    if (existingMatrix) {
      await prisma.systemSetting.update({
        where: { key: 'role_permission_matrix' },
        data: {
          value: JSON.stringify(updatedMatrix),
          updatedAt: new Date()
        }
      });
      console.log('✅ Updated existing permission matrix');
    } else {
      await prisma.systemSetting.create({
        data: {
          key: 'role_permission_matrix',
          value: JSON.stringify(updatedMatrix),
          description: 'Comprehensive role-based permission matrix including detailed task and issue permissions',
          category: 'permissions',
          isActive: true
        }
      });
      console.log('✅ Created new permission matrix');
    }

    // Create permission events for audit trail
    const permissionEvents = [
      // Task events
      { name: 'view_tasks', description: 'View tasks', category: 'tasks', isActive: true },
      { name: 'create_tasks', description: 'Create tasks', category: 'tasks', isActive: true },
      { name: 'edit_tasks', description: 'Edit tasks', category: 'tasks', isActive: true },
      { name: 'delete_tasks', description: 'Delete tasks', category: 'tasks', isActive: true },
      { name: 'assign_tasks', description: 'Assign tasks', category: 'tasks', isActive: true },
      { name: 'complete_tasks', description: 'Complete tasks', category: 'tasks', isActive: true },
      { name: 'approve_tasks', description: 'Approve tasks', category: 'tasks', isActive: true },
      { name: 'comment_tasks', description: 'Comment on tasks', category: 'tasks', isActive: true },
      { name: 'view_task_history', description: 'View task history', category: 'tasks', isActive: true },
      { name: 'export_task_table', description: 'Export task table', category: 'tasks', isActive: true },
      { name: 'export_task_gantt', description: 'Export task Gantt chart', category: 'tasks', isActive: true },
      { name: 'export_task_pdf', description: 'Export task PDF', category: 'tasks', isActive: true },
      { name: 'export_task_excel', description: 'Export task Excel', category: 'tasks', isActive: true },
      { name: 'import_tasks', description: 'Import tasks', category: 'tasks', isActive: true },
      { name: 'filter_tasks', description: 'Filter tasks', category: 'tasks', isActive: true },
      { name: 'search_tasks', description: 'Search tasks', category: 'tasks', isActive: true },
      { name: 'sort_tasks', description: 'Sort tasks', category: 'tasks', isActive: true },
      { name: 'view_task_statistics', description: 'View task statistics', category: 'tasks', isActive: true },
      { name: 'manage_task_categories', description: 'Manage task categories', category: 'tasks', isActive: true },
      { name: 'view_overdue_tasks', description: 'View overdue tasks', category: 'tasks', isActive: true },
      { name: 'view_upcoming_tasks', description: 'View upcoming tasks', category: 'tasks', isActive: true },
      { name: 'change_task_status', description: 'Change task status', category: 'tasks', isActive: true },
      { name: 'change_task_priority', description: 'Change task priority', category: 'tasks', isActive: true },
      { name: 'attach_documents_to_tasks', description: 'Attach documents to tasks', category: 'tasks', isActive: true },
      
      // Issue events
      { name: 'view_issues', description: 'View issues', category: 'issues', isActive: true },
      { name: 'create_issues', description: 'Create issues', category: 'issues', isActive: true },
      { name: 'edit_issues', description: 'Edit issues', category: 'issues', isActive: true },
      { name: 'delete_issues', description: 'Delete issues', category: 'issues', isActive: true },
      { name: 'assign_issues', description: 'Assign issues', category: 'issues', isActive: true },
      { name: 'resolve_issues', description: 'Resolve issues', category: 'issues', isActive: true },
      { name: 'approve_issues', description: 'Approve issues', category: 'issues', isActive: true },
      { name: 'comment_issues', description: 'Comment on issues', category: 'issues', isActive: true },
      { name: 'view_issue_history', description: 'View issue history', category: 'issues', isActive: true },
      { name: 'export_issue_table', description: 'Export issue table', category: 'issues', isActive: true },
      { name: 'export_issue_gantt', description: 'Export issue Gantt chart', category: 'issues', isActive: true },
      { name: 'export_issue_pdf', description: 'Export issue PDF', category: 'issues', isActive: true },
      { name: 'export_issue_excel', description: 'Export issue Excel', category: 'issues', isActive: true },
      { name: 'import_issues', description: 'Import issues', category: 'issues', isActive: true },
      { name: 'filter_issues', description: 'Filter issues', category: 'issues', isActive: true },
      { name: 'search_issues', description: 'Search issues', category: 'issues', isActive: true },
      { name: 'sort_issues', description: 'Sort issues', category: 'issues', isActive: true },
      { name: 'view_issue_statistics', description: 'View issue statistics', category: 'issues', isActive: true },
      { name: 'manage_issue_types', description: 'Manage issue types', category: 'issues', isActive: true },
      { name: 'view_overdue_issues', description: 'View overdue issues', category: 'issues', isActive: true },
      { name: 'view_warning_issues', description: 'View warning issues', category: 'issues', isActive: true },
      { name: 'change_issue_status', description: 'Change issue status', category: 'issues', isActive: true },
      { name: 'change_issue_priority', description: 'Change issue priority', category: 'issues', isActive: true },
      { name: 'attach_documents_to_issues', description: 'Attach documents to issues', category: 'issues', isActive: true }
    ];

    // Create permission events in database (if table exists)
    try {
      for (const event of permissionEvents) {
        await prisma.permissionEvent.upsert({
          where: { name: event.name },
          update: event,
          create: event
        });
      }
      console.log('✅ Created/updated permission events');
    } catch (error) {
      console.log('⚠️ PermissionEvent table not found, skipping event creation');
    }

    console.log('🎉 Successfully added detailed task and issue permissions!');
    console.log(`📊 Total permissions in matrix: ${Object.keys(updatedMatrix).length}`);
    console.log(`📋 Task permissions: ${Object.keys(newTaskPermissions).length}`);
    console.log(`📋 Issue permissions: ${Object.keys(newIssuePermissions).length}`);

  } catch (error) {
    console.error('❌ Error adding detailed permissions:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
