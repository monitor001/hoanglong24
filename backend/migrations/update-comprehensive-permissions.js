const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating comprehensive permission matrix...');

  // Comprehensive permission matrix with all permissions
  const comprehensiveMatrix = {
    // Dashboard permissions (4 permissions)
    'dashboard_view': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'dashboard_export': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'dashboard_print': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'dashboard_download': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Projects permissions (24 permissions)
    'view_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delete_projects': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_project_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_project_members': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'assign_project_roles': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_project_progress': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'update_project_status': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_project_settings': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_project_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'import_project_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_project_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'restore_project_versions': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'archive_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_archived_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'restore_archived_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_project_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'use_project_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'share_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_shared_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_project_permissions': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_project_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'bulk_manage_projects': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Tasks permissions (16 permissions)
    'view_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_task_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'assign_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'update_task_status': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_task_progress': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_task_priorities': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_task_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'export_task_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'import_task_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_task_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'use_task_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'bulk_manage_tasks': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_task_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Issues permissions (16 permissions)
    'view_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_issue_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'assign_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'update_issue_status': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_issue_progress': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_issue_priorities': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_issue_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'export_issue_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'import_issue_data': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_issue_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'use_issue_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'bulk_manage_issues': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_issue_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Documents ISO permissions (20 permissions)
    'view_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'upload_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'download_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'view_document_metadata': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'edit_document_metadata': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'manage_document_versions': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'approve_document_versions': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_document_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'restore_document_versions': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'share_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'comment_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_document_comments': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'export_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'archive_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_archived_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'restore_archived_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_document_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'bulk_upload_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Calendar permissions (16 permissions)
    'view_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_events': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_events': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_events': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_event_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_event_attendees': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'send_event_invitations': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_calendar_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'manage_calendar_settings': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_team_calendar': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_recurring_events': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_event_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'restore_deleted_events': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_event_categories': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'bulk_manage_events': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Notes permissions (18 permissions)
    'view_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_note_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'share_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_shared_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'edit_shared_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'manage_note_folders': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_note_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'restore_note_versions': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'import_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_note_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'pin_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'archive_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'view_archived_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'restore_archived_notes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Design Checklist permissions (20 permissions)
    'view_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_checklist_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_checklist_items': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'check_checklist_items': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'uncheck_checklist_items': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'manage_checklist_categories': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_checklist_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'use_checklist_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'export_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'import_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_checklist_progress': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_checklist_assignments': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_checklist_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'restore_checklist_versions': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'archive_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_archived_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'restore_archived_checklists': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Approval Kanban permissions (24 permissions)
    'view_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'create_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'edit_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'delete_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_approval_details': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'submit_for_approval': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'approve_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'reject_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'request_changes': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'assign_approvers': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_approval_history': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'manage_approval_workflow': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_approval_statistics': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_approval_reports': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_approval_stages': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'set_approval_priorities': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_approval_comments': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'add_approval_comments': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false },
    'manage_approval_deadlines': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_approval_dashboard': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false },
    'manage_approval_notifications': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'bulk_approve_documents': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_approval_templates': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'archive_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_archived_approvals': { ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Users permissions (12 permissions) - Only ADMIN access
    'view_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'create_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delete_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_user_details': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_user_roles': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_user_activity': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_user_sessions': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_user_data': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'import_user_data': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_user_statistics': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'bulk_manage_users': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Reports permissions (8 permissions) - Only ADMIN access
    'view_reports': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'create_reports': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_reports': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'delete_reports': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'export_reports': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'schedule_reports': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_report_history': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_report_templates': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },

    // Settings permissions (12 permissions) - Only ADMIN access
    'view_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'edit_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_permissions': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_sessions': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_system_logs': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_system_backup': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_iso_config': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_audit_logs': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_email_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_notification_settings': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'view_system_statistics': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false },
    'manage_system_maintenance': { ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false }
  };

  // Check if permission matrix already exists
  const existingMatrix = await prisma.systemSetting.findUnique({
    where: { key: 'role_permission_matrix' }
  });

  if (existingMatrix) {
    // Update existing matrix
    await prisma.systemSetting.update({
      where: { key: 'role_permission_matrix' },
      data: {
        value: JSON.stringify(comprehensiveMatrix),
        description: 'Comprehensive role-based permission matrix with all modules',
        category: 'permissions',
        updatedAt: new Date()
      }
    });
    console.log('✅ Updated existing permission matrix with comprehensive permissions');
  } else {
    // Create new matrix
    await prisma.systemSetting.create({
      data: {
        key: 'role_permission_matrix',
        value: JSON.stringify(comprehensiveMatrix),
        description: 'Comprehensive role-based permission matrix with all modules',
        category: 'permissions',
        isActive: true
      }
    });
    console.log('✅ Created new comprehensive permission matrix');
  }

  console.log('📊 Permission matrix summary:');
  console.log(`   - Total permissions: ${Object.keys(comprehensiveMatrix).length}`);
  console.log(`   - Categories: Dashboard, Projects, Tasks, Issues, Documents, Calendar, Notes, Checklist, Approval, Users, Reports, Settings`);
  console.log(`   - Roles: ADMIN, PROJECT_MANAGER, BIM_MANAGER, CONTRIBUTOR, VIEWER, USER`);
  console.log('🎯 Admin-only permissions: Users, Reports, Settings');
  console.log('🔒 Security: Only ADMIN can access user management, reports, and system settings');
}

main()
  .catch((e) => {
    console.error('❌ Error updating permission matrix:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
