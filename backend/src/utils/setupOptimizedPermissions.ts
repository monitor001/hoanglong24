import { prisma } from '../db';
import { PERMISSION_CODES, PERMISSION_CATEGORIES, ROLE_PERMISSIONS } from './optimizedPermissions';

/**
 * Setup optimized permissions system
 */
export class SetupOptimizedPermissions {
  /**
   * Create all permissions in database
   */
  static async createPermissions() {
    console.log('Creating permissions...');
    
    const permissions = [
      // Project Management
      {
        code: PERMISSION_CODES.PROJECT_VIEW,
        name: 'View Projects',
        nameVi: 'Xem dự án',
        description: 'Can view project information',
        category: PERMISSION_CATEGORIES.PROJECT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.PROJECT_CREATE,
        name: 'Create Projects',
        nameVi: 'Tạo dự án',
        description: 'Can create new projects',
        category: PERMISSION_CATEGORIES.PROJECT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.PROJECT_EDIT,
        name: 'Edit Projects',
        nameVi: 'Chỉnh sửa dự án',
        description: 'Can edit project information',
        category: PERMISSION_CATEGORIES.PROJECT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.PROJECT_DELETE,
        name: 'Delete Projects',
        nameVi: 'Xóa dự án',
        description: 'Can delete projects',
        category: PERMISSION_CATEGORIES.PROJECT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.PROJECT_MANAGE_MEMBERS,
        name: 'Manage Project Members',
        nameVi: 'Quản lý thành viên dự án',
        description: 'Can add/remove project members',
        category: PERMISSION_CATEGORIES.PROJECT_MANAGEMENT
      },

      // Task Management
      {
        code: PERMISSION_CODES.TASK_VIEW,
        name: 'View Tasks',
        nameVi: 'Xem công việc',
        description: 'Can view tasks',
        category: PERMISSION_CATEGORIES.TASK_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.TASK_CREATE,
        name: 'Create Tasks',
        nameVi: 'Tạo công việc',
        description: 'Can create new tasks',
        category: PERMISSION_CATEGORIES.TASK_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.TASK_EDIT,
        name: 'Edit Tasks',
        nameVi: 'Chỉnh sửa công việc',
        description: 'Can edit tasks',
        category: PERMISSION_CATEGORIES.TASK_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.TASK_DELETE,
        name: 'Delete Tasks',
        nameVi: 'Xóa công việc',
        description: 'Can delete tasks',
        category: PERMISSION_CATEGORIES.TASK_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.TASK_ASSIGN,
        name: 'Assign Tasks',
        nameVi: 'Phân công công việc',
        description: 'Can assign tasks to users',
        category: PERMISSION_CATEGORIES.TASK_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.TASK_APPROVE,
        name: 'Approve Tasks',
        nameVi: 'Phê duyệt công việc',
        description: 'Can approve task completion',
        category: PERMISSION_CATEGORIES.TASK_MANAGEMENT
      },

      // Document Management
      {
        code: PERMISSION_CODES.DOCUMENT_VIEW,
        name: 'View Documents',
        nameVi: 'Xem tài liệu',
        description: 'Can view documents',
        category: PERMISSION_CATEGORIES.DOCUMENT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.DOCUMENT_UPLOAD,
        name: 'Upload Documents',
        nameVi: 'Tải lên tài liệu',
        description: 'Can upload documents',
        category: PERMISSION_CATEGORIES.DOCUMENT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.DOCUMENT_EDIT,
        name: 'Edit Documents',
        nameVi: 'Chỉnh sửa tài liệu',
        description: 'Can edit document metadata',
        category: PERMISSION_CATEGORIES.DOCUMENT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.DOCUMENT_DELETE,
        name: 'Delete Documents',
        nameVi: 'Xóa tài liệu',
        description: 'Can delete documents',
        category: PERMISSION_CATEGORIES.DOCUMENT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.DOCUMENT_APPROVE,
        name: 'Approve Documents',
        nameVi: 'Phê duyệt tài liệu',
        description: 'Can approve documents',
        category: PERMISSION_CATEGORIES.DOCUMENT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.DOCUMENT_DOWNLOAD,
        name: 'Download Documents',
        nameVi: 'Tải xuống tài liệu',
        description: 'Can download documents',
        category: PERMISSION_CATEGORIES.DOCUMENT_MANAGEMENT
      },

      // User Management
      {
        code: PERMISSION_CODES.USER_VIEW,
        name: 'View Users',
        nameVi: 'Xem người dùng',
        description: 'Can view user information',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.USER_CREATE,
        name: 'Create Users',
        nameVi: 'Tạo người dùng',
        description: 'Can create new users',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.USER_EDIT,
        name: 'Edit Users',
        nameVi: 'Chỉnh sửa người dùng',
        description: 'Can edit user information',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.USER_DELETE,
        name: 'Delete Users',
        nameVi: 'Xóa người dùng',
        description: 'Can delete users',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.USER_MANAGE_ROLES,
        name: 'Manage User Roles',
        nameVi: 'Quản lý vai trò người dùng',
        description: 'Can manage user roles and permissions',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT
      },

      // Report Management
      {
        code: PERMISSION_CODES.REPORT_VIEW,
        name: 'View Reports',
        nameVi: 'Xem báo cáo',
        description: 'Can view reports',
        category: PERMISSION_CATEGORIES.REPORT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.REPORT_CREATE,
        name: 'Create Reports',
        nameVi: 'Tạo báo cáo',
        description: 'Can create reports',
        category: PERMISSION_CATEGORIES.REPORT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.REPORT_EDIT,
        name: 'Edit Reports',
        nameVi: 'Chỉnh sửa báo cáo',
        description: 'Can edit reports',
        category: PERMISSION_CATEGORIES.REPORT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.REPORT_DELETE,
        name: 'Delete Reports',
        nameVi: 'Xóa báo cáo',
        description: 'Can delete reports',
        category: PERMISSION_CATEGORIES.REPORT_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.REPORT_EXPORT,
        name: 'Export Reports',
        nameVi: 'Xuất báo cáo',
        description: 'Can export reports',
        category: PERMISSION_CATEGORIES.REPORT_MANAGEMENT
      },

      // Checklist Management
      {
        code: PERMISSION_CODES.CHECKLIST_VIEW,
        name: 'View Checklists',
        nameVi: 'Xem checklist',
        description: 'Can view checklists',
        category: PERMISSION_CATEGORIES.CHECKLIST_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.CHECKLIST_CREATE,
        name: 'Create Checklists',
        nameVi: 'Tạo checklist',
        description: 'Can create checklists',
        category: PERMISSION_CATEGORIES.CHECKLIST_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.CHECKLIST_EDIT,
        name: 'Edit Checklists',
        nameVi: 'Chỉnh sửa checklist',
        description: 'Can edit checklists',
        category: PERMISSION_CATEGORIES.CHECKLIST_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.CHECKLIST_DELETE,
        name: 'Delete Checklists',
        nameVi: 'Xóa checklist',
        description: 'Can delete checklists',
        category: PERMISSION_CATEGORIES.CHECKLIST_MANAGEMENT
      },
      {
        code: PERMISSION_CODES.CHECKLIST_APPROVE,
        name: 'Approve Checklists',
        nameVi: 'Phê duyệt checklist',
        description: 'Can approve checklists',
        category: PERMISSION_CATEGORIES.CHECKLIST_MANAGEMENT
      },

      // System Admin
      {
        code: PERMISSION_CODES.SYSTEM_SETTINGS,
        name: 'System Settings',
        nameVi: 'Cài đặt hệ thống',
        description: 'Can manage system settings',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMIN
      },
      {
        code: PERMISSION_CODES.SYSTEM_BACKUP,
        name: 'System Backup',
        nameVi: 'Sao lưu hệ thống',
        description: 'Can perform system backups',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMIN
      },
      {
        code: PERMISSION_CODES.SYSTEM_LOGS,
        name: 'System Logs',
        nameVi: 'Nhật ký hệ thống',
        description: 'Can view system logs',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMIN
      }
    ];

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { code: permission.code },
        update: permission,
        create: permission
      });
    }

    console.log(`Created ${permissions.length} permissions`);
  }

  /**
   * Create user roles in database
   */
  static async createUserRoles() {
    console.log('Creating user roles...');
    
    const roles = [
      {
        code: 'ADMIN',
        name: 'Administrator',
        nameVi: 'Quản trị viên',
        color: '#dc3545',
        description: 'Full system access with all permissions'
      },
      {
        code: 'PROJECT_MANAGER',
        name: 'Project Manager',
        nameVi: 'Quản lý dự án',
        color: '#007bff',
        description: 'Project management with limited system access'
      },
      {
        code: 'BIM_MANAGER',
        name: 'BIM Manager',
        nameVi: 'Quản lý BIM',
        color: '#28a745',
        description: 'BIM management with task and document access'
      },
      {
        code: 'CONTRIBUTOR',
        name: 'Contributor',
        nameVi: 'Cộng tác viên',
        color: '#ffc107',
        description: 'Contributor with limited project access'
      },
      {
        code: 'VIEWER',
        name: 'Viewer',
        nameVi: 'Người xem',
        color: '#6c757d',
        description: 'Read-only access to projects'
      }
    ];

    for (const role of roles) {
      await prisma.userRole.upsert({
        where: { code: role.code },
        update: role,
        create: role
      });
    }

    console.log(`Created ${roles.length} user roles`);
  }

  /**
   * Assign permissions to roles
   */
  static async assignRolePermissions() {
    console.log('Assigning permissions to roles...');
    
    // Get all permissions and roles from database
    const permissions = await prisma.permission.findMany({ where: { isActive: true } });
    const roles = await prisma.userRole.findMany({ where: { isActive: true } });

    // Create permission map
    const permissionMap = new Map(permissions.map(p => [p.code, p.id]));
    const roleMap = new Map(roles.map(r => [r.code, r.id]));

    // Assign permissions based on ROLE_PERMISSIONS matrix
    for (const [roleCode, roleConfig] of Object.entries(ROLE_PERMISSIONS)) {
      const roleId = roleMap.get(roleCode);
      if (!roleId) {
        console.warn(`Role ${roleCode} not found in database`);
        continue;
      }

      for (const permissionCode of roleConfig.permissions) {
        const permissionId = permissionMap.get(permissionCode);
        if (!permissionId) {
          console.warn(`Permission ${permissionCode} not found in database`);
          continue;
        }

        // Create or update role permission
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId
            }
          },
          update: {
            granted: true,
            grantedAt: new Date()
          },
          create: {
            roleId,
            permissionId,
            granted: true,
            grantedAt: new Date()
          }
        });
      }
    }

    console.log('Role permissions assigned successfully');
  }

  /**
   * Setup complete permission system
   */
  static async setupComplete() {
    try {
      console.log('Setting up optimized permission system...');
      
      await this.createPermissions();
      await this.createUserRoles();
      await this.assignRolePermissions();
      
      console.log('Permission system setup completed successfully!');
    } catch (error) {
      console.error('Error setting up permission system:', error);
      throw error;
    }
  }

  /**
   * Reset permission system (for testing)
   */
  static async resetPermissionSystem() {
    try {
      console.log('Resetting permission system...');
      
      // Delete all role permissions
      await prisma.rolePermission.deleteMany();
      
      // Delete all permissions
      await prisma.permission.deleteMany();
      
      // Delete all user roles
      await prisma.userRole.deleteMany();
      
      console.log('Permission system reset completed');
    } catch (error) {
      console.error('Error resetting permission system:', error);
      throw error;
    }
  }
}
