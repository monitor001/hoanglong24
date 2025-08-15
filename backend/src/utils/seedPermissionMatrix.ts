import { prisma } from '../db';

export const seedPermissionMatrix = async () => {
  try {
    console.log('🌱 Seeding permission matrix...');

    // Default permission matrix
    const defaultPermissionMatrix = {
      // Dashboard permissions
      dashboard_view: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: true 
      },
      dashboard_export: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      dashboard_print: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: true 
      },
      dashboard_download: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // Project permissions
      view_projects: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: true 
      },
      create_projects: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      edit_projects: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      delete_projects: { 
        ADMIN: true, 
        PROJECT_MANAGER: false, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // Document permissions
      view_documents: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: true 
      },
      create_documents: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      edit_documents: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      delete_documents: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // Task permissions
      view_tasks: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: true 
      },
      create_tasks: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      edit_tasks: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      delete_tasks: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // Issue permissions
      view_issues: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: true 
      },
      create_issues: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      edit_issues: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      delete_issues: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // Calendar permissions
      view_calendar: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: true 
      },
      create_calendar: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      edit_calendar: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      delete_calendar: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // Approval permissions
      view_approvals: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      create_approvals: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      edit_approvals: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      approve_approvals: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // User management permissions
      manage_users: { 
        ADMIN: true, 
        PROJECT_MANAGER: false, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      manage_groups: { 
        ADMIN: true, 
        PROJECT_MANAGER: false, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // System permissions
      system_settings: { 
        ADMIN: true, 
        PROJECT_MANAGER: false, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      view_audit_log: { 
        ADMIN: true, 
        PROJECT_MANAGER: false, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      export_data: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },
      delete_data: { 
        ADMIN: true, 
        PROJECT_MANAGER: false, 
        BIM_MANAGER: false, 
        CONTRIBUTOR: false, 
        VIEWER: false 
      },

      // Additional permissions
      comment_documents: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      upload_files: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      },
      edit_content: { 
        ADMIN: true, 
        PROJECT_MANAGER: true, 
        BIM_MANAGER: true, 
        CONTRIBUTOR: true, 
        VIEWER: false 
      }
    };

    // Check if permission matrix already exists
    const existingMatrix = await prisma.systemSetting.findUnique({
      where: { key: 'role_permission_matrix' }
    });

    if (existingMatrix) {
      console.log('📝 Updating existing permission matrix...');
      await prisma.systemSetting.update({
        where: { id: existingMatrix.id },
        data: {
          value: JSON.stringify(defaultPermissionMatrix),
          updatedAt: new Date()
        }
      });
    } else {
      console.log('📝 Creating new permission matrix...');
      await prisma.systemSetting.create({
        data: {
          key: 'role_permission_matrix',
          value: JSON.stringify(defaultPermissionMatrix),
          description: 'Role-based permission matrix for system access control',
          category: 'permissions',
          isActive: true
        }
      });
    }

    console.log('✅ Permission matrix seeded successfully!');
    return {
      success: true,
      message: 'Permission matrix seeded successfully'
    };
  } catch (error) {
    console.error('❌ Permission matrix seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedPermissionMatrix()
    .then((result) => {
      console.log('📊 Seeding Result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

// Export for CommonJS
module.exports = { seedPermissionMatrix };
