// Simple test script for permissions
console.log('🔍 Testing permissions logic...\n');

// Mock data
const mockUser = {
  id: 'e61c69bb-a638-4d4f-93a9-8aa9bca2981a',
  email: 'hoanglong@hoanglong24.com',
  name: 'HoangLong',
  role: 'PROJECT_MANAGER'
};

const mockUserPermissions = [
  'dashboard_print',
  'create_projects',
  'edit_projects',
  'delete_projects',
  'view_project_details',
  'manage_project_members',
  'assign_project_roles',
  'view_project_progress',
  'update_project_status',
  'manage_project_settings',
  'view_todo',
  'create_todo',
  'export_project_data',
  'import_project_data',
  'view_project_history',
  'restore_project_versions',
  'archive_projects',
  'view_archived_projects',
  'restore_archived_projects',
  'manage_project_templates',
  'use_project_templates',
  'share_projects',
  'edit_todo',
  'complete_todo',
  'view_shared_projects',
  'manage_project_permissions',
  'view_project_statistics',
  'bulk_manage_projects',
  'view_tasks',
  'create_tasks',
  'edit_tasks',
  'delete_tasks',
  'view_task_details',
  'update_task_status',
  'view_task_progress',
  'manage_task_priorities',
  'view_task_history',
  'export_task_data',
  'import_task_data',
  'manage_task_templates',
  'use_task_templates',
  'dashboard_export',
  'view_issue_details',
  'assign_issues',
  'update_issue_status',
  'view_issue_progress',
  'view_issue_history',
  'export_issue_data',
  'import_issue_data',
  'manage_issue_templates',
  'use_issue_templates',
  'bulk_manage_issues',
  'view_document_metadata',
  'edit_document_metadata',
  'manage_document_versions',
  'view_document_history',
  'restore_document_versions',
  'share_documents',
  'view_documents',
  'create_issues',
  'delete_issues',
  'edit_issues',
  'comment_documents',
  'view_document_comments',
  'export_documents',
  'view_archived_documents',
  'view_issue_statistics',
  'restore_archived_documents',
  'manage_document_templates',
  'bulk_upload_documents',
  'view_calendar',
  'create_events',
  'edit_events',
  'delete_events',
  'manage_event_attendees',
  'view_issues',
  'export_calendar',
  'manage_calendar_settings',
  'manage_recurring_events',
  'view_event_history',
  'restore_deleted_events',
  'manage_event_categories',
  'bulk_manage_events',
  'view_notes',
  'create_notes',
  'edit_notes',
  'delete_notes',
  'view_note_details',
  'share_notes',
  'edit_shared_notes',
  'manage_note_folders',
  'view_note_history',
  'restore_note_versions',
  'export_notes',
  'import_notes',
  'manage_note_templates',
  'pin_notes',
  'archive_notes',
  'view_archived_notes',
  'restore_archived_notes',
  'view_checklists',
  'view_checklist_details',
  'check_checklist_items',
  'uncheck_checklist_items',
  'use_checklist_templates',
  'import_checklists',
  'view_checklist_progress',
  'manage_checklist_assignments',
  'view_checklist_history',
  'view_calendar_statistics',
  'view_archived_checklists',
  'view_approvals',
  'edit_approvals',
  'delete_approvals',
  'view_approval_details',
  'submit_for_approval',
  'reject_documents',
  'request_changes',
  'view_approval_history',
  'assign_tasks',
  'bulk_manage_tasks',
  'view_projects',
  'view_approval_statistics',
  'export_approval_reports',
  'manage_approval_stages',
  'set_approval_priorities',
  'view_approval_comments',
  'manage_approval_deadlines',
  'view_approval_dashboard',
  'manage_approval_notifications',
  'manage_checklist_categories',
  'manage_checklist_items',
  'manage_checklist_templates',
  'restore_archived_checklists',
  'bulk_approve_documents',
  'manage_approval_templates',
  'archive_approvals',
  'view_archived_approvals',
  'archive_checklists',
  'dashboard_view',
  'dashboard_download',
  'view_task_statistics',
  'manage_issue_priorities',
  'approve_document_versions',
  'send_event_invitations',
  'view_shared_notes',
  'restore_checklist_versions',
  'add_approval_comments',
  'approve_documents',
  'assign_approvers',
  'create_approvals',
  'view_event_details',
  'view_team_calendar',
  'create_checklists',
  'delete_checklists',
  'edit_checklists',
  'export_checklists'
];

// Test hasPermission function
function hasPermission(permission) {
  if (!mockUserPermissions || !mockUser?.role) {
    console.log(`❌ hasPermission('${permission}') = false (userPermissions: ${!!mockUserPermissions}, user.role: ${!!mockUser?.role})`);
    return false;
  }
  const result = mockUserPermissions.includes(permission);
  console.log(`✅ hasPermission('${permission}') = ${result}`);
  return result;
}

// Test different scenarios
console.log('🧪 Testing different scenarios:\n');

console.log('1️⃣ Testing with valid data:');
const canViewTasks1 = hasPermission('view_tasks');
console.log(`   canViewTasks = ${canViewTasks1}\n`);

console.log('2️⃣ Testing with empty permissions:');
const emptyPermissions = [];
function hasPermissionEmpty(permission) {
  if (!emptyPermissions || !mockUser?.role) {
    console.log(`❌ hasPermission('${permission}') = false (userPermissions: ${!!emptyPermissions}, user.role: ${!!mockUser?.role})`);
    return false;
  }
  const result = emptyPermissions.includes(permission);
  console.log(`✅ hasPermission('${permission}') = ${result}`);
  return result;
}
const canViewTasks2 = hasPermissionEmpty('view_tasks');
console.log(`   canViewTasks = ${canViewTasks2}\n`);

console.log('3️⃣ Testing with null permissions:');
const nullPermissions = null;
function hasPermissionNull(permission) {
  if (!nullPermissions || !mockUser?.role) {
    console.log(`❌ hasPermission('${permission}') = false (userPermissions: ${!!nullPermissions}, user.role: ${!!mockUser?.role})`);
    return false;
  }
  const result = nullPermissions.includes(permission);
  console.log(`✅ hasPermission('${permission}') = ${result}`);
  return result;
}
const canViewTasks3 = hasPermissionNull('view_tasks');
console.log(`   canViewTasks = ${canViewTasks3}\n`);

console.log('4️⃣ Testing with user without role:');
const userWithoutRole = { ...mockUser, role: null };
function hasPermissionNoRole(permission) {
  if (!mockUserPermissions || !userWithoutRole?.role) {
    console.log(`❌ hasPermission('${permission}') = false (userPermissions: ${!!mockUserPermissions}, user.role: ${!!userWithoutRole?.role})`);
    return false;
  }
  const result = mockUserPermissions.includes(permission);
  console.log(`✅ hasPermission('${permission}') = ${result}`);
  return result;
}
const canViewTasks4 = hasPermissionNoRole('view_tasks');
console.log(`   canViewTasks = ${canViewTasks4}\n`);

console.log('📊 Summary:');
console.log(`   Scenario 1 (Valid data): ${canViewTasks1 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Scenario 2 (Empty permissions): ${canViewTasks2 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Scenario 3 (Null permissions): ${canViewTasks3 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Scenario 4 (No user role): ${canViewTasks4 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n🎯 Conclusion:');
if (canViewTasks1) {
  console.log('✅ Logic is working correctly with valid data');
  console.log('❌ The issue is likely in the frontend data loading');
} else {
  console.log('❌ Logic has issues even with valid data');
}
