const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createComprehensivePermissions() {
  try {
    console.log('🌱 Creating comprehensive permission system...');

    // Define comprehensive permissions for all modules
    const comprehensivePermissions = {
      // Dashboard permissions (4 permissions)
      'dashboard_view': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'dashboard_export': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'dashboard_print': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'dashboard_download': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Project permissions (24 permissions)
      'view_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'edit_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'delete_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_project_details': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'export_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_project_members': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'upload_project_images': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'add_project_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_project_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'edit_project_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_project_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'share_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_project_statistics': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'export_project_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_project_settings': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_project_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'restore_project_versions': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'archive_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_archived_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'restore_archived_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_project_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'clone_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'import_projects': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Documents ISO permissions (20 permissions)
      'view_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'edit_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'upload_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'download_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'view_document_metadata': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'edit_document_metadata': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'manage_document_versions': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'approve_document_versions': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_document_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'restore_document_versions': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'share_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'comment_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_document_comments': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'export_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'archive_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_archived_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'restore_archived_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_document_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'bulk_upload_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Calendar permissions (16 permissions)
      'view_calendar': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_events': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'edit_events': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_events': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_event_details': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'manage_event_attendees': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'send_event_invitations': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_calendar_statistics': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'export_calendar': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_calendar_settings': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_team_calendar': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'manage_recurring_events': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_event_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'restore_deleted_events': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_event_categories': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'bulk_manage_events': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Notes permissions (18 permissions)
      'view_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'edit_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_note_details': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'share_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_shared_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'edit_shared_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'manage_note_folders': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_note_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'restore_note_versions': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'export_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'import_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_note_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'pin_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'archive_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_archived_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'restore_archived_notes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },

      // Design Checklist permissions (20 permissions)
      'view_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'edit_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_checklist_details': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'manage_checklist_items': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'check_checklist_items': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'uncheck_checklist_items': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'manage_checklist_categories': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_checklist_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'use_checklist_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'export_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'import_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_checklist_progress': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'manage_checklist_assignments': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_checklist_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'restore_checklist_versions': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'archive_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_archived_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'restore_archived_checklists': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Approval Kanban permissions (24 permissions)
      'view_approvals': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_approvals': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'edit_approvals': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_approvals': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_approval_details': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'submit_for_approval': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'approve_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'reject_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'request_changes': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'assign_approvers': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_approval_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'manage_approval_workflow': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_approval_statistics': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'export_approval_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_approval_stages': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'set_approval_priorities': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_approval_comments': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'add_approval_comments': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'manage_approval_deadlines': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_approval_dashboard': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'manage_approval_notifications': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'bulk_approve_documents': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_approval_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'archive_approvals': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_archived_approvals': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Task permissions (16 permissions)
      'view_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'edit_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'assign_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'complete_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_task_details': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'view_task_progress': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'export_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_task_categories': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_task_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'restore_deleted_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_task_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'bulk_manage_tasks': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_task_statistics': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'manage_task_priorities': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },

      // Issue permissions (16 permissions)
      'view_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'create_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'edit_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'delete_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'assign_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'resolve_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_issue_details': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: true 
      },
      'view_issue_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'export_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_issue_categories': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_issue_priorities': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: false, USER: false 
      },
      'view_issue_statistics': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: true, VIEWER: true, USER: false 
      },
      'restore_deleted_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_issue_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'bulk_manage_issues': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_issue_workflow': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // User management permissions (12 permissions)
      'view_users': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'create_users': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'edit_users': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'delete_users': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_user_details': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_user_roles': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_user_activity': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'export_user_data': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_user_sessions': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'reset_user_password': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'bulk_manage_users': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_user_statistics': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Settings permissions (8 permissions)
      'view_settings': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'edit_settings': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_permissions': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_audit_logs': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'export_system_data': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_system_backup': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_system_statistics': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_system_updates': { 
        ADMIN: true, PROJECT_MANAGER: false, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },

      // Reports permissions (8 permissions)
      'view_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'create_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'edit_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'delete_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'export_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'schedule_reports': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'view_report_history': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: true, CONTRIBUTOR: false, VIEWER: false, USER: false 
      },
      'manage_report_templates': { 
        ADMIN: true, PROJECT_MANAGER: true, BIM_MANAGER: false, CONTRIBUTOR: false, VIEWER: false, USER: false 
      }
    };

    // Check if permission matrix already exists
    const existingMatrix = await prisma.systemSetting.findUnique({
      where: { key: 'role_permission_matrix' }
    });

    if (existingMatrix) {
      console.log('✅ Permission matrix already exists, updating with comprehensive permissions...');
      
      // Update existing matrix with new comprehensive permissions
      await prisma.systemSetting.update({
        where: { key: 'role_permission_matrix' },
        data: {
          value: JSON.stringify(comprehensivePermissions),
          description: 'Comprehensive role-based permission matrix for all modules',
          updatedAt: new Date()
        }
      });
    } else {
      console.log('✅ Creating new comprehensive permission matrix...');
      
      // Create new permission matrix
      await prisma.systemSetting.create({
        data: {
          key: 'role_permission_matrix',
          value: JSON.stringify(comprehensivePermissions),
          description: 'Comprehensive role-based permission matrix for all modules',
          category: 'permissions',
          isActive: true
        }
      });
    }

    console.log('✅ Comprehensive permission system created successfully!');
    console.log(`📊 Total permissions: ${Object.keys(comprehensivePermissions).length}`);
    console.log('🎯 Modules covered: Dashboard, Projects, Documents, Calendar, Notes, Design Checklist, Approval Kanban, Tasks, Issues, Users, Settings, Reports');

  } catch (error) {
    console.error('❌ Error creating comprehensive permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
createComprehensivePermissions()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
