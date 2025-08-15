// Comprehensive Permission Definitions for All Modules
export const comprehensivePermissions = [
  // Dashboard permissions (4 permissions)
  {
    id: 'dashboard_view',
    name: 'View Dashboard',
    nameVi: 'Xem bảng điều khiển',
    category: 'dashboard',
    description: 'View system dashboard and overview'
  },
  {
    id: 'dashboard_export',
    name: 'Export Dashboard',
    nameVi: 'Xuất bảng điều khiển',
    category: 'dashboard',
    description: 'Export dashboard data and reports'
  },
  {
    id: 'dashboard_print',
    name: 'Print Dashboard',
    nameVi: 'In bảng điều khiển',
    category: 'dashboard',
    description: 'Print dashboard views and reports'
  },
  {
    id: 'dashboard_download',
    name: 'Download Dashboard Data',
    nameVi: 'Tải dữ liệu bảng điều khiển',
    category: 'dashboard',
    description: 'Download dashboard data files'
  },

  // Projects permissions (24 permissions)
  {
    id: 'view_projects',
    name: 'View Projects',
    nameVi: 'Xem dự án',
    category: 'projects',
    description: 'View projects list and details'
  },
  {
    id: 'create_projects',
    name: 'Create Projects',
    nameVi: 'Tạo dự án',
    category: 'projects',
    description: 'Create new projects'
  },
  {
    id: 'edit_projects',
    name: 'Edit Projects',
    nameVi: 'Chỉnh sửa dự án',
    category: 'projects',
    description: 'Edit existing projects'
  },
  {
    id: 'delete_projects',
    name: 'Delete Projects',
    nameVi: 'Xóa dự án',
    category: 'projects',
    description: 'Delete projects'
  },
  {
    id: 'view_project_details',
    name: 'View Project Details',
    nameVi: 'Xem chi tiết dự án',
    category: 'projects',
    description: 'View detailed project information'
  },
  {
    id: 'manage_project_members',
    name: 'Manage Project Members',
    nameVi: 'Quản lý thành viên dự án',
    category: 'projects',
    description: 'Manage project team members'
  },
  {
    id: 'assign_project_roles',
    name: 'Assign Project Roles',
    nameVi: 'Phân công vai trò dự án',
    category: 'projects',
    description: 'Assign roles to project members'
  },
  {
    id: 'view_project_progress',
    name: 'View Project Progress',
    nameVi: 'Xem tiến độ dự án',
    category: 'projects',
    description: 'View project progress and status'
  },
  {
    id: 'update_project_status',
    name: 'Update Project Status',
    nameVi: 'Cập nhật trạng thái dự án',
    category: 'projects',
    description: 'Update project status'
  },
  {
    id: 'manage_project_settings',
    name: 'Manage Project Settings',
    nameVi: 'Quản lý cài đặt dự án',
    category: 'projects',
    description: 'Manage project settings'
  },
  {
    id: 'export_project_data',
    name: 'Export Project Data',
    nameVi: 'Xuất dữ liệu dự án',
    category: 'projects',
    description: 'Export project data and reports'
  },
  {
    id: 'import_project_data',
    name: 'Import Project Data',
    nameVi: 'Nhập dữ liệu dự án',
    category: 'projects',
    description: 'Import project data'
  },
  {
    id: 'view_project_history',
    name: 'View Project History',
    nameVi: 'Xem lịch sử dự án',
    category: 'projects',
    description: 'View project change history'
  },
  {
    id: 'restore_project_versions',
    name: 'Restore Project Versions',
    nameVi: 'Khôi phục phiên bản dự án',
    category: 'projects',
    description: 'Restore previous project versions'
  },
  {
    id: 'archive_projects',
    name: 'Archive Projects',
    nameVi: 'Lưu trữ dự án',
    category: 'projects',
    description: 'Archive projects'
  },
  {
    id: 'view_archived_projects',
    name: 'View Archived Projects',
    nameVi: 'Xem dự án đã lưu trữ',
    category: 'projects',
    description: 'View archived projects'
  },
  {
    id: 'restore_archived_projects',
    name: 'Restore Archived Projects',
    nameVi: 'Khôi phục dự án đã lưu trữ',
    category: 'projects',
    description: 'Restore archived projects'
  },
  {
    id: 'manage_project_templates',
    name: 'Manage Project Templates',
    nameVi: 'Quản lý mẫu dự án',
    category: 'projects',
    description: 'Manage project templates'
  },
  {
    id: 'use_project_templates',
    name: 'Use Project Templates',
    nameVi: 'Sử dụng mẫu dự án',
    category: 'projects',
    description: 'Use project templates'
  },
  {
    id: 'share_projects',
    name: 'Share Projects',
    nameVi: 'Chia sẻ dự án',
    category: 'projects',
    description: 'Share projects with others'
  },
  {
    id: 'view_shared_projects',
    name: 'View Shared Projects',
    nameVi: 'Xem dự án được chia sẻ',
    category: 'projects',
    description: 'View projects shared with you'
  },
  {
    id: 'manage_project_permissions',
    name: 'Manage Project Permissions',
    nameVi: 'Quản lý quyền dự án',
    category: 'projects',
    description: 'Manage project-specific permissions'
  },
  {
    id: 'view_project_statistics',
    name: 'View Project Statistics',
    nameVi: 'Xem thống kê dự án',
    category: 'projects',
    description: 'View project statistics and analytics'
  },
  {
    id: 'bulk_manage_projects',
    name: 'Bulk Manage Projects',
    nameVi: 'Quản lý hàng loạt dự án',
    category: 'projects',
    description: 'Manage multiple projects at once'
  },

  // Tasks permissions (16 permissions)
  {
    id: 'view_tasks',
    name: 'View Tasks',
    nameVi: 'Xem nhiệm vụ',
    category: 'tasks',
    description: 'View tasks list and details'
  },
  {
    id: 'create_tasks',
    name: 'Create Tasks',
    nameVi: 'Tạo nhiệm vụ',
    category: 'tasks',
    description: 'Create new tasks'
  },
  {
    id: 'edit_tasks',
    name: 'Edit Tasks',
    nameVi: 'Chỉnh sửa nhiệm vụ',
    category: 'tasks',
    description: 'Edit existing tasks'
  },
  {
    id: 'delete_tasks',
    name: 'Delete Tasks',
    nameVi: 'Xóa nhiệm vụ',
    category: 'tasks',
    description: 'Delete tasks'
  },
  {
    id: 'view_task_details',
    name: 'View Task Details',
    nameVi: 'Xem chi tiết nhiệm vụ',
    category: 'tasks',
    description: 'View detailed task information'
  },
  {
    id: 'assign_tasks',
    name: 'Assign Tasks',
    nameVi: 'Phân công nhiệm vụ',
    category: 'tasks',
    description: 'Assign tasks to users'
  },
  {
    id: 'update_task_status',
    name: 'Update Task Status',
    nameVi: 'Cập nhật trạng thái nhiệm vụ',
    category: 'tasks',
    description: 'Update task status'
  },
  {
    id: 'view_task_progress',
    name: 'View Task Progress',
    nameVi: 'Xem tiến độ nhiệm vụ',
    category: 'tasks',
    description: 'View task progress'
  },
  {
    id: 'manage_task_priorities',
    name: 'Manage Task Priorities',
    nameVi: 'Quản lý ưu tiên nhiệm vụ',
    category: 'tasks',
    description: 'Manage task priorities'
  },
  {
    id: 'view_task_history',
    name: 'View Task History',
    nameVi: 'Xem lịch sử nhiệm vụ',
    category: 'tasks',
    description: 'View task change history'
  },
  {
    id: 'export_task_data',
    name: 'Export Task Data',
    nameVi: 'Xuất dữ liệu nhiệm vụ',
    category: 'tasks',
    description: 'Export task data and reports'
  },
  {
    id: 'import_task_data',
    name: 'Import Task Data',
    nameVi: 'Nhập dữ liệu nhiệm vụ',
    category: 'tasks',
    description: 'Import task data'
  },
  {
    id: 'manage_task_templates',
    name: 'Manage Task Templates',
    nameVi: 'Quản lý mẫu nhiệm vụ',
    category: 'tasks',
    description: 'Manage task templates'
  },
  {
    id: 'use_task_templates',
    name: 'Use Task Templates',
    nameVi: 'Sử dụng mẫu nhiệm vụ',
    category: 'tasks',
    description: 'Use task templates'
  },
  {
    id: 'bulk_manage_tasks',
    name: 'Bulk Manage Tasks',
    nameVi: 'Quản lý hàng loạt nhiệm vụ',
    category: 'tasks',
    description: 'Manage multiple tasks at once'
  },
  {
    id: 'view_task_statistics',
    name: 'View Task Statistics',
    nameVi: 'Xem thống kê nhiệm vụ',
    category: 'tasks',
    description: 'View task statistics and analytics'
  },

  // Issues permissions (16 permissions)
  {
    id: 'view_issues',
    name: 'View Issues',
    nameVi: 'Xem vấn đề',
    category: 'issues',
    description: 'View issues list and details'
  },
  {
    id: 'create_issues',
    name: 'Create Issues',
    nameVi: 'Tạo vấn đề',
    category: 'issues',
    description: 'Create new issues'
  },
  {
    id: 'edit_issues',
    name: 'Edit Issues',
    nameVi: 'Chỉnh sửa vấn đề',
    category: 'issues',
    description: 'Edit existing issues'
  },
  {
    id: 'delete_issues',
    name: 'Delete Issues',
    nameVi: 'Xóa vấn đề',
    category: 'issues',
    description: 'Delete issues'
  },
  {
    id: 'view_issue_details',
    name: 'View Issue Details',
    nameVi: 'Xem chi tiết vấn đề',
    category: 'issues',
    description: 'View detailed issue information'
  },
  {
    id: 'assign_issues',
    name: 'Assign Issues',
    nameVi: 'Phân công vấn đề',
    category: 'issues',
    description: 'Assign issues to users'
  },
  {
    id: 'update_issue_status',
    name: 'Update Issue Status',
    nameVi: 'Cập nhật trạng thái vấn đề',
    category: 'issues',
    description: 'Update issue status'
  },
  {
    id: 'view_issue_progress',
    name: 'View Issue Progress',
    nameVi: 'Xem tiến độ vấn đề',
    category: 'issues',
    description: 'View issue progress'
  },
  {
    id: 'manage_issue_priorities',
    name: 'Manage Issue Priorities',
    nameVi: 'Quản lý ưu tiên vấn đề',
    category: 'issues',
    description: 'Manage issue priorities'
  },
  {
    id: 'view_issue_history',
    name: 'View Issue History',
    nameVi: 'Xem lịch sử vấn đề',
    category: 'issues',
    description: 'View issue change history'
  },
  {
    id: 'export_issue_data',
    name: 'Export Issue Data',
    nameVi: 'Xuất dữ liệu vấn đề',
    category: 'issues',
    description: 'Export issue data and reports'
  },
  {
    id: 'import_issue_data',
    name: 'Import Issue Data',
    nameVi: 'Nhập dữ liệu vấn đề',
    category: 'issues',
    description: 'Import issue data'
  },
  {
    id: 'manage_issue_templates',
    name: 'Manage Issue Templates',
    nameVi: 'Quản lý mẫu vấn đề',
    category: 'issues',
    description: 'Manage issue templates'
  },
  {
    id: 'use_issue_templates',
    name: 'Use Issue Templates',
    nameVi: 'Sử dụng mẫu vấn đề',
    category: 'issues',
    description: 'Use issue templates'
  },
  {
    id: 'bulk_manage_issues',
    name: 'Bulk Manage Issues',
    nameVi: 'Quản lý hàng loạt vấn đề',
    category: 'issues',
    description: 'Manage multiple issues at once'
  },
  {
    id: 'view_issue_statistics',
    name: 'View Issue Statistics',
    nameVi: 'Xem thống kê vấn đề',
    category: 'issues',
    description: 'View issue statistics and analytics'
  },

  // Documents ISO permissions (20 permissions)
  {
    id: 'view_documents',
    name: 'View Documents',
    nameVi: 'Xem tài liệu',
    category: 'documents',
    description: 'View documents and files'
  },
  {
    id: 'create_documents',
    name: 'Create Documents',
    nameVi: 'Tạo tài liệu',
    category: 'documents',
    description: 'Create new documents'
  },
  {
    id: 'edit_documents',
    name: 'Edit Documents',
    nameVi: 'Chỉnh sửa tài liệu',
    category: 'documents',
    description: 'Edit existing documents'
  },
  {
    id: 'delete_documents',
    name: 'Delete Documents',
    nameVi: 'Xóa tài liệu',
    category: 'documents',
    description: 'Delete documents'
  },
  {
    id: 'upload_documents',
    name: 'Upload Documents',
    nameVi: 'Tải lên tài liệu',
    category: 'documents',
    description: 'Upload new document files'
  },
  {
    id: 'download_documents',
    name: 'Download Documents',
    nameVi: 'Tải xuống tài liệu',
    category: 'documents',
    description: 'Download document files'
  },
  {
    id: 'view_document_metadata',
    name: 'View Document Metadata',
    nameVi: 'Xem thông tin tài liệu',
    category: 'documents',
    description: 'View document metadata and properties'
  },
  {
    id: 'edit_document_metadata',
    name: 'Edit Document Metadata',
    nameVi: 'Chỉnh sửa thông tin tài liệu',
    category: 'documents',
    description: 'Edit document metadata and properties'
  },
  {
    id: 'manage_document_versions',
    name: 'Manage Document Versions',
    nameVi: 'Quản lý phiên bản tài liệu',
    category: 'documents',
    description: 'Manage document versioning'
  },
  {
    id: 'approve_document_versions',
    name: 'Approve Document Versions',
    nameVi: 'Phê duyệt phiên bản tài liệu',
    category: 'documents',
    description: 'Approve document versions'
  },
  {
    id: 'view_document_history',
    name: 'View Document History',
    nameVi: 'Xem lịch sử tài liệu',
    category: 'documents',
    description: 'View document change history'
  },
  {
    id: 'restore_document_versions',
    name: 'Restore Document Versions',
    nameVi: 'Khôi phục phiên bản tài liệu',
    category: 'documents',
    description: 'Restore previous document versions'
  },
  {
    id: 'share_documents',
    name: 'Share Documents',
    nameVi: 'Chia sẻ tài liệu',
    category: 'documents',
    description: 'Share documents with others'
  },
  {
    id: 'comment_documents',
    name: 'Comment on Documents',
    nameVi: 'Bình luận tài liệu',
    category: 'documents',
    description: 'Add comments to documents'
  },
  {
    id: 'view_document_comments',
    name: 'View Document Comments',
    nameVi: 'Xem bình luận tài liệu',
    category: 'documents',
    description: 'View comments on documents'
  },
  {
    id: 'export_documents',
    name: 'Export Documents',
    nameVi: 'Xuất tài liệu',
    category: 'documents',
    description: 'Export document data'
  },
  {
    id: 'archive_documents',
    name: 'Archive Documents',
    nameVi: 'Lưu trữ tài liệu',
    category: 'documents',
    description: 'Archive documents'
  },
  {
    id: 'view_archived_documents',
    name: 'View Archived Documents',
    nameVi: 'Xem tài liệu đã lưu trữ',
    category: 'documents',
    description: 'View archived documents'
  },
  {
    id: 'restore_archived_documents',
    name: 'Restore Archived Documents',
    nameVi: 'Khôi phục tài liệu đã lưu trữ',
    category: 'documents',
    description: 'Restore archived documents'
  },
  {
    id: 'manage_document_templates',
    name: 'Manage Document Templates',
    nameVi: 'Quản lý mẫu tài liệu',
    category: 'documents',
    description: 'Manage document templates'
  },
  {
    id: 'bulk_upload_documents',
    name: 'Bulk Upload Documents',
    nameVi: 'Tải lên hàng loạt tài liệu',
    category: 'documents',
    description: 'Upload multiple documents at once'
  },

  // Calendar permissions (16 permissions)
  {
    id: 'view_calendar',
    name: 'View Calendar',
    nameVi: 'Xem lịch',
    category: 'calendar',
    description: 'View calendar events'
  },
  {
    id: 'create_events',
    name: 'Create Events',
    nameVi: 'Tạo sự kiện',
    category: 'calendar',
    description: 'Create new calendar events'
  },
  {
    id: 'edit_events',
    name: 'Edit Events',
    nameVi: 'Chỉnh sửa sự kiện',
    category: 'calendar',
    description: 'Edit existing calendar events'
  },
  {
    id: 'delete_events',
    name: 'Delete Events',
    nameVi: 'Xóa sự kiện',
    category: 'calendar',
    description: 'Delete calendar events'
  },
  {
    id: 'view_event_details',
    name: 'View Event Details',
    nameVi: 'Xem chi tiết sự kiện',
    category: 'calendar',
    description: 'View detailed event information'
  },
  {
    id: 'manage_event_attendees',
    name: 'Manage Event Attendees',
    nameVi: 'Quản lý người tham dự',
    category: 'calendar',
    description: 'Manage event attendees'
  },
  {
    id: 'send_event_invitations',
    name: 'Send Event Invitations',
    nameVi: 'Gửi lời mời sự kiện',
    category: 'calendar',
    description: 'Send event invitations'
  },
  {
    id: 'view_calendar_statistics',
    name: 'View Calendar Statistics',
    nameVi: 'Xem thống kê lịch',
    category: 'calendar',
    description: 'View calendar statistics'
  },
  {
    id: 'export_calendar',
    name: 'Export Calendar',
    nameVi: 'Xuất lịch',
    category: 'calendar',
    description: 'Export calendar data'
  },
  {
    id: 'manage_calendar_settings',
    name: 'Manage Calendar Settings',
    nameVi: 'Quản lý cài đặt lịch',
    category: 'calendar',
    description: 'Manage calendar settings'
  },
  {
    id: 'view_team_calendar',
    name: 'View Team Calendar',
    nameVi: 'Xem lịch nhóm',
    category: 'calendar',
    description: 'View team calendar'
  },
  {
    id: 'manage_recurring_events',
    name: 'Manage Recurring Events',
    nameVi: 'Quản lý sự kiện định kỳ',
    category: 'calendar',
    description: 'Manage recurring events'
  },
  {
    id: 'view_event_history',
    name: 'View Event History',
    nameVi: 'Xem lịch sử sự kiện',
    category: 'calendar',
    description: 'View event history'
  },
  {
    id: 'restore_deleted_events',
    name: 'Restore Deleted Events',
    nameVi: 'Khôi phục sự kiện đã xóa',
    category: 'calendar',
    description: 'Restore deleted events'
  },
  {
    id: 'manage_event_categories',
    name: 'Manage Event Categories',
    nameVi: 'Quản lý danh mục sự kiện',
    category: 'calendar',
    description: 'Manage event categories'
  },
  {
    id: 'bulk_manage_events',
    name: 'Bulk Manage Events',
    nameVi: 'Quản lý hàng loạt sự kiện',
    category: 'calendar',
    description: 'Manage multiple events at once'
  },

  // Notes permissions (18 permissions)
  {
    id: 'view_notes',
    name: 'View Notes',
    nameVi: 'Xem ghi chú',
    category: 'notes',
    description: 'View notes'
  },
  {
    id: 'create_notes',
    name: 'Create Notes',
    nameVi: 'Tạo ghi chú',
    category: 'notes',
    description: 'Create new notes'
  },
  {
    id: 'edit_notes',
    name: 'Edit Notes',
    nameVi: 'Chỉnh sửa ghi chú',
    category: 'notes',
    description: 'Edit existing notes'
  },
  {
    id: 'delete_notes',
    name: 'Delete Notes',
    nameVi: 'Xóa ghi chú',
    category: 'notes',
    description: 'Delete notes'
  },
  {
    id: 'view_note_details',
    name: 'View Note Details',
    nameVi: 'Xem chi tiết ghi chú',
    category: 'notes',
    description: 'View detailed note information'
  },
  {
    id: 'share_notes',
    name: 'Share Notes',
    nameVi: 'Chia sẻ ghi chú',
    category: 'notes',
    description: 'Share notes with others'
  },
  {
    id: 'view_shared_notes',
    name: 'View Shared Notes',
    nameVi: 'Xem ghi chú được chia sẻ',
    category: 'notes',
    description: 'View notes shared with you'
  },
  {
    id: 'edit_shared_notes',
    name: 'Edit Shared Notes',
    nameVi: 'Chỉnh sửa ghi chú được chia sẻ',
    category: 'notes',
    description: 'Edit notes shared with you'
  },
  {
    id: 'manage_note_folders',
    name: 'Manage Note Folders',
    nameVi: 'Quản lý thư mục ghi chú',
    category: 'notes',
    description: 'Manage note folders'
  },
  {
    id: 'view_note_history',
    name: 'View Note History',
    nameVi: 'Xem lịch sử ghi chú',
    category: 'notes',
    description: 'View note change history'
  },
  {
    id: 'restore_note_versions',
    name: 'Restore Note Versions',
    nameVi: 'Khôi phục phiên bản ghi chú',
    category: 'notes',
    description: 'Restore previous note versions'
  },
  {
    id: 'export_notes',
    name: 'Export Notes',
    nameVi: 'Xuất ghi chú',
    category: 'notes',
    description: 'Export note data'
  },
  {
    id: 'import_notes',
    name: 'Import Notes',
    nameVi: 'Nhập ghi chú',
    category: 'notes',
    description: 'Import note data'
  },
  {
    id: 'manage_note_templates',
    name: 'Manage Note Templates',
    nameVi: 'Quản lý mẫu ghi chú',
    category: 'notes',
    description: 'Manage note templates'
  },
  {
    id: 'pin_notes',
    name: 'Pin Notes',
    nameVi: 'Ghim ghi chú',
    category: 'notes',
    description: 'Pin important notes'
  },
  {
    id: 'archive_notes',
    name: 'Archive Notes',
    nameVi: 'Lưu trữ ghi chú',
    category: 'notes',
    description: 'Archive notes'
  },
  {
    id: 'view_archived_notes',
    name: 'View Archived Notes',
    nameVi: 'Xem ghi chú đã lưu trữ',
    category: 'notes',
    description: 'View archived notes'
  },
  {
    id: 'restore_archived_notes',
    name: 'Restore Archived Notes',
    nameVi: 'Khôi phục ghi chú đã lưu trữ',
    category: 'notes',
    description: 'Restore archived notes'
  },

  // Design Checklist permissions (20 permissions)
  {
    id: 'view_checklists',
    name: 'View Checklists',
    nameVi: 'Xem danh sách kiểm tra',
    category: 'checklist',
    description: 'View design checklists'
  },
  {
    id: 'create_checklists',
    name: 'Create Checklists',
    nameVi: 'Tạo danh sách kiểm tra',
    category: 'checklist',
    description: 'Create new design checklists'
  },
  {
    id: 'edit_checklists',
    name: 'Edit Checklists',
    nameVi: 'Chỉnh sửa danh sách kiểm tra',
    category: 'checklist',
    description: 'Edit existing design checklists'
  },
  {
    id: 'delete_checklists',
    name: 'Delete Checklists',
    nameVi: 'Xóa danh sách kiểm tra',
    category: 'checklist',
    description: 'Delete design checklists'
  },
  {
    id: 'view_checklist_details',
    name: 'View Checklist Details',
    nameVi: 'Xem chi tiết danh sách kiểm tra',
    category: 'checklist',
    description: 'View detailed checklist information'
  },
  {
    id: 'manage_checklist_items',
    name: 'Manage Checklist Items',
    nameVi: 'Quản lý mục kiểm tra',
    category: 'checklist',
    description: 'Manage checklist items'
  },
  {
    id: 'check_checklist_items',
    name: 'Check Checklist Items',
    nameVi: 'Kiểm tra mục kiểm tra',
    category: 'checklist',
    description: 'Mark checklist items as checked'
  },
  {
    id: 'uncheck_checklist_items',
    name: 'Uncheck Checklist Items',
    nameVi: 'Bỏ kiểm tra mục kiểm tra',
    category: 'checklist',
    description: 'Mark checklist items as unchecked'
  },
  {
    id: 'manage_checklist_categories',
    name: 'Manage Checklist Categories',
    nameVi: 'Quản lý danh mục kiểm tra',
    category: 'checklist',
    description: 'Manage checklist categories'
  },
  {
    id: 'manage_checklist_templates',
    name: 'Manage Checklist Templates',
    nameVi: 'Quản lý mẫu danh sách kiểm tra',
    category: 'checklist',
    description: 'Manage checklist templates'
  },
  {
    id: 'use_checklist_templates',
    name: 'Use Checklist Templates',
    nameVi: 'Sử dụng mẫu danh sách kiểm tra',
    category: 'checklist',
    description: 'Use checklist templates'
  },
  {
    id: 'export_checklists',
    name: 'Export Checklists',
    nameVi: 'Xuất danh sách kiểm tra',
    category: 'checklist',
    description: 'Export checklist data'
  },
  {
    id: 'import_checklists',
    name: 'Import Checklists',
    nameVi: 'Nhập danh sách kiểm tra',
    category: 'checklist',
    description: 'Import checklist data'
  },
  {
    id: 'view_checklist_progress',
    name: 'View Checklist Progress',
    nameVi: 'Xem tiến độ danh sách kiểm tra',
    category: 'checklist',
    description: 'View checklist progress'
  },
  {
    id: 'manage_checklist_assignments',
    name: 'Manage Checklist Assignments',
    nameVi: 'Quản lý phân công danh sách kiểm tra',
    category: 'checklist',
    description: 'Manage checklist assignments'
  },
  {
    id: 'view_checklist_history',
    name: 'View Checklist History',
    nameVi: 'Xem lịch sử danh sách kiểm tra',
    category: 'checklist',
    description: 'View checklist change history'
  },
  {
    id: 'restore_checklist_versions',
    name: 'Restore Checklist Versions',
    nameVi: 'Khôi phục phiên bản danh sách kiểm tra',
    category: 'checklist',
    description: 'Restore previous checklist versions'
  },
  {
    id: 'archive_checklists',
    name: 'Archive Checklists',
    nameVi: 'Lưu trữ danh sách kiểm tra',
    category: 'checklist',
    description: 'Archive checklists'
  },
  {
    id: 'view_archived_checklists',
    name: 'View Archived Checklists',
    nameVi: 'Xem danh sách kiểm tra đã lưu trữ',
    category: 'checklist',
    description: 'View archived checklists'
  },
  {
    id: 'restore_archived_checklists',
    name: 'Restore Archived Checklists',
    nameVi: 'Khôi phục danh sách kiểm tra đã lưu trữ',
    category: 'checklist',
    description: 'Restore archived checklists'
  },

  // Approval Kanban permissions (24 permissions)
  {
    id: 'view_approvals',
    name: 'View Approvals',
    nameVi: 'Xem phê duyệt',
    category: 'approval',
    description: 'View approval requests'
  },
  {
    id: 'create_approvals',
    name: 'Create Approvals',
    nameVi: 'Tạo yêu cầu phê duyệt',
    category: 'approval',
    description: 'Create new approval requests'
  },
  {
    id: 'edit_approvals',
    name: 'Edit Approvals',
    nameVi: 'Chỉnh sửa phê duyệt',
    category: 'approval',
    description: 'Edit approval requests'
  },
  {
    id: 'delete_approvals',
    name: 'Delete Approvals',
    nameVi: 'Xóa phê duyệt',
    category: 'approval',
    description: 'Delete approval requests'
  },
  {
    id: 'view_approval_details',
    name: 'View Approval Details',
    nameVi: 'Xem chi tiết phê duyệt',
    category: 'approval',
    description: 'View detailed approval information'
  },
  {
    id: 'submit_for_approval',
    name: 'Submit for Approval',
    nameVi: 'Gửi phê duyệt',
    category: 'approval',
    description: 'Submit documents for approval'
  },
  {
    id: 'approve_documents',
    name: 'Approve Documents',
    nameVi: 'Phê duyệt tài liệu',
    category: 'approval',
    description: 'Approve documents'
  },
  {
    id: 'reject_documents',
    name: 'Reject Documents',
    nameVi: 'Từ chối tài liệu',
    category: 'approval',
    description: 'Reject documents'
  },
  {
    id: 'request_changes',
    name: 'Request Changes',
    nameVi: 'Yêu cầu thay đổi',
    category: 'approval',
    description: 'Request changes to documents'
  },
  {
    id: 'assign_approvers',
    name: 'Assign Approvers',
    nameVi: 'Phân công người phê duyệt',
    category: 'approval',
    description: 'Assign approvers to documents'
  },
  {
    id: 'view_approval_history',
    name: 'View Approval History',
    nameVi: 'Xem lịch sử phê duyệt',
    category: 'approval',
    description: 'View approval history'
  },
  {
    id: 'manage_approval_workflow',
    name: 'Manage Approval Workflow',
    nameVi: 'Quản lý quy trình phê duyệt',
    category: 'approval',
    description: 'Manage approval workflow'
  },
  {
    id: 'view_approval_statistics',
    name: 'View Approval Statistics',
    nameVi: 'Xem thống kê phê duyệt',
    category: 'approval',
    description: 'View approval statistics'
  },
  {
    id: 'export_approval_reports',
    name: 'Export Approval Reports',
    nameVi: 'Xuất báo cáo phê duyệt',
    category: 'approval',
    description: 'Export approval reports'
  },
  {
    id: 'manage_approval_stages',
    name: 'Manage Approval Stages',
    nameVi: 'Quản lý giai đoạn phê duyệt',
    category: 'approval',
    description: 'Manage approval stages'
  },
  {
    id: 'set_approval_priorities',
    name: 'Set Approval Priorities',
    nameVi: 'Thiết lập ưu tiên phê duyệt',
    category: 'approval',
    description: 'Set approval priorities'
  },
  {
    id: 'view_approval_comments',
    name: 'View Approval Comments',
    nameVi: 'Xem bình luận phê duyệt',
    category: 'approval',
    description: 'View approval comments'
  },
  {
    id: 'add_approval_comments',
    name: 'Add Approval Comments',
    nameVi: 'Thêm bình luận phê duyệt',
    category: 'approval',
    description: 'Add approval comments'
  },
  {
    id: 'manage_approval_deadlines',
    name: 'Manage Approval Deadlines',
    nameVi: 'Quản lý thời hạn phê duyệt',
    category: 'approval',
    description: 'Manage approval deadlines'
  },
  {
    id: 'view_approval_dashboard',
    name: 'View Approval Dashboard',
    nameVi: 'Xem bảng điều khiển phê duyệt',
    category: 'approval',
    description: 'View approval dashboard'
  },
  {
    id: 'manage_approval_notifications',
    name: 'Manage Approval Notifications',
    nameVi: 'Quản lý thông báo phê duyệt',
    category: 'approval',
    description: 'Manage approval notifications'
  },
  {
    id: 'bulk_approve_documents',
    name: 'Bulk Approve Documents',
    nameVi: 'Phê duyệt hàng loạt tài liệu',
    category: 'approval',
    description: 'Approve multiple documents at once'
  },
  {
    id: 'manage_approval_templates',
    name: 'Manage Approval Templates',
    nameVi: 'Quản lý mẫu phê duyệt',
    category: 'approval',
    description: 'Manage approval templates'
  },
  {
    id: 'archive_approvals',
    name: 'Archive Approvals',
    nameVi: 'Lưu trữ phê duyệt',
    category: 'approval',
    description: 'Archive approvals'
  },
  {
    id: 'view_archived_approvals',
    name: 'View Archived Approvals',
    nameVi: 'Xem phê duyệt đã lưu trữ',
    category: 'approval',
    description: 'View archived approvals'
  },

  // Users permissions (12 permissions) - Only ADMIN access
  {
    id: 'view_users',
    name: 'View Users',
    nameVi: 'Xem người dùng',
    category: 'users',
    description: 'View users list and details'
  },
  {
    id: 'create_users',
    name: 'Create Users',
    nameVi: 'Tạo người dùng',
    category: 'users',
    description: 'Create new users'
  },
  {
    id: 'edit_users',
    name: 'Edit Users',
    nameVi: 'Chỉnh sửa người dùng',
    category: 'users',
    description: 'Edit existing users'
  },
  {
    id: 'delete_users',
    name: 'Delete Users',
    nameVi: 'Xóa người dùng',
    category: 'users',
    description: 'Delete users'
  },
  {
    id: 'view_user_details',
    name: 'View User Details',
    nameVi: 'Xem chi tiết người dùng',
    category: 'users',
    description: 'View detailed user information'
  },
  {
    id: 'manage_user_roles',
    name: 'Manage User Roles',
    nameVi: 'Quản lý vai trò người dùng',
    category: 'users',
    description: 'Manage user roles and permissions'
  },
  {
    id: 'view_user_activity',
    name: 'View User Activity',
    nameVi: 'Xem hoạt động người dùng',
    category: 'users',
    description: 'View user activity logs'
  },
  {
    id: 'manage_user_sessions',
    name: 'Manage User Sessions',
    nameVi: 'Quản lý phiên đăng nhập người dùng',
    category: 'users',
    description: 'Manage user login sessions'
  },
  {
    id: 'export_user_data',
    name: 'Export User Data',
    nameVi: 'Xuất dữ liệu người dùng',
    category: 'users',
    description: 'Export user data and reports'
  },
  {
    id: 'import_user_data',
    name: 'Import User Data',
    nameVi: 'Nhập dữ liệu người dùng',
    category: 'users',
    description: 'Import user data'
  },
  {
    id: 'view_user_statistics',
    name: 'View User Statistics',
    nameVi: 'Xem thống kê người dùng',
    category: 'users',
    description: 'View user statistics and analytics'
  },
  {
    id: 'bulk_manage_users',
    name: 'Bulk Manage Users',
    nameVi: 'Quản lý hàng loạt người dùng',
    category: 'users',
    description: 'Manage multiple users at once'
  },

  // Reports permissions (8 permissions) - Only ADMIN access
  {
    id: 'view_reports',
    name: 'View Reports',
    nameVi: 'Xem báo cáo',
    category: 'reports',
    description: 'View system reports'
  },
  {
    id: 'create_reports',
    name: 'Create Reports',
    nameVi: 'Tạo báo cáo',
    category: 'reports',
    description: 'Create new reports'
  },
  {
    id: 'edit_reports',
    name: 'Edit Reports',
    nameVi: 'Chỉnh sửa báo cáo',
    category: 'reports',
    description: 'Edit existing reports'
  },
  {
    id: 'delete_reports',
    name: 'Delete Reports',
    nameVi: 'Xóa báo cáo',
    category: 'reports',
    description: 'Delete reports'
  },
  {
    id: 'export_reports',
    name: 'Export Reports',
    nameVi: 'Xuất báo cáo',
    category: 'reports',
    description: 'Export reports'
  },
  {
    id: 'schedule_reports',
    name: 'Schedule Reports',
    nameVi: 'Lên lịch báo cáo',
    category: 'reports',
    description: 'Schedule automated reports'
  },
  {
    id: 'view_report_history',
    name: 'View Report History',
    nameVi: 'Xem lịch sử báo cáo',
    category: 'reports',
    description: 'View report generation history'
  },
  {
    id: 'manage_report_templates',
    name: 'Manage Report Templates',
    nameVi: 'Quản lý mẫu báo cáo',
    category: 'reports',
    description: 'Manage report templates'
  },

  // Settings permissions (12 permissions) - Only ADMIN access
  {
    id: 'view_settings',
    name: 'View Settings',
    nameVi: 'Xem cài đặt',
    category: 'settings',
    description: 'View system settings'
  },
  {
    id: 'edit_settings',
    name: 'Edit Settings',
    nameVi: 'Chỉnh sửa cài đặt',
    category: 'settings',
    description: 'Edit system settings'
  },
  {
    id: 'manage_permissions',
    name: 'Manage Permissions',
    nameVi: 'Quản lý phân quyền',
    category: 'settings',
    description: 'Manage system permissions'
  },
  {
    id: 'manage_sessions',
    name: 'Manage Sessions',
    nameVi: 'Quản lý phiên đăng nhập',
    category: 'settings',
    description: 'Manage user login sessions'
  },
  {
    id: 'view_system_logs',
    name: 'View System Logs',
    nameVi: 'Xem nhật ký hệ thống',
    category: 'settings',
    description: 'View system activity logs'
  },
  {
    id: 'manage_system_backup',
    name: 'Manage System Backup',
    nameVi: 'Quản lý sao lưu hệ thống',
    category: 'settings',
    description: 'Manage system backup and restore'
  },
  {
    id: 'manage_iso_config',
    name: 'Manage ISO Configuration',
    nameVi: 'Quản lý cấu hình ISO',
    category: 'settings',
    description: 'Manage ISO 19650 configuration'
  },
  {
    id: 'view_audit_logs',
    name: 'View Audit Logs',
    nameVi: 'Xem nhật ký kiểm toán',
    category: 'settings',
    description: 'View audit logs'
  },
  {
    id: 'manage_email_settings',
    name: 'Manage Email Settings',
    nameVi: 'Quản lý cài đặt email',
    category: 'settings',
    description: 'Manage email configuration'
  },
  {
    id: 'manage_notification_settings',
    name: 'Manage Notification Settings',
    nameVi: 'Quản lý cài đặt thông báo',
    category: 'settings',
    description: 'Manage notification settings'
  },
  {
    id: 'view_system_statistics',
    name: 'View System Statistics',
    nameVi: 'Xem thống kê hệ thống',
    category: 'settings',
    description: 'View system statistics'
  },
  {
    id: 'manage_system_maintenance',
    name: 'Manage System Maintenance',
    nameVi: 'Quản lý bảo trì hệ thống',
    category: 'settings',
    description: 'Manage system maintenance tasks'
  }
];

// Role definitions with colors (for permission matrix - exclude ADMIN)
export const roles = [
  {
    id: 'PROJECT_MANAGER',
    name: 'Project Manager',
    nameVi: 'Quản lý dự án',
    color: '#1890ff',
    description: 'Project management access'
  },
  {
    id: 'BIM_MANAGER',
    name: 'BIM Manager',
    nameVi: 'Quản lý BIM',
    color: '#722ed1',
    description: 'BIM management access'
  },
  {
    id: 'CONTRIBUTOR',
    name: 'Contributor',
    nameVi: 'Cộng tác viên',
    color: '#52c41a',
    description: 'Contribution access'
  },
  {
    id: 'VIEWER',
    name: 'Viewer',
    nameVi: 'Người xem',
    color: '#faad14',
    description: 'Read-only access'
  },
  {
    id: 'USER',
    name: 'User',
    nameVi: 'Người dùng',
    color: '#8c8c8c',
    description: 'Basic user access'
  }
];

// All roles including ADMIN (for user management)
export const allRoles = [
  {
    id: 'ADMIN',
    name: 'Administrator',
    nameVi: 'Quản trị viên',
    color: '#ff4d4f',
    description: 'Full system access'
  },
  ...roles
];

// Category definitions with colors
export const categories = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    nameVi: 'Bảng điều khiển',
    color: '#1890ff',
    description: 'Dashboard and overview permissions'
  },
  {
    id: 'projects',
    name: 'Projects',
    nameVi: 'Dự án',
    color: '#52c41a',
    description: 'Project management permissions'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    nameVi: 'Nhiệm vụ',
    color: '#faad14',
    description: 'Task management permissions'
  },
  {
    id: 'issues',
    name: 'Issues',
    nameVi: 'Vấn đề',
    color: '#f5222d',
    description: 'Issue management permissions'
  },
  {
    id: 'documents',
    name: 'Documents ISO',
    nameVi: 'Tài liệu ISO',
    color: '#13c2c2',
    description: 'Document management permissions'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    nameVi: 'Lịch',
    color: '#722ed1',
    description: 'Calendar and event permissions'
  },
  {
    id: 'notes',
    name: 'Notes',
    nameVi: 'Ghi chú',
    color: '#eb2f96',
    description: 'Note management permissions'
  },
  {
    id: 'checklist',
    name: 'Design Checklist',
    nameVi: 'Hồ sơ thiết kế',
    color: '#fa8c16',
    description: 'Design checklist permissions'
  },
  {
    id: 'approval',
    name: 'Approval Kanban',
    nameVi: 'Phê duyệt hồ sơ',
    color: '#a0d911',
    description: 'Approval workflow permissions'
  },
  {
    id: 'users',
    name: 'Users',
    nameVi: 'Người dùng',
    color: '#ff4d4f',
    description: 'User management permissions (Admin only)'
  },
  {
    id: 'reports',
    name: 'Reports',
    nameVi: 'Báo cáo',
    color: '#1890ff',
    description: 'Report management permissions (Admin only)'
  },
  {
    id: 'settings',
    name: 'Settings',
    nameVi: 'Cài đặt',
    color: '#8c8c8c',
    description: 'System settings permissions (Admin only)'
  }
];
