const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating settings permissions for multiple roles...');

  // Get existing permission matrix
  const existingMatrix = await prisma.systemSetting.findUnique({
    where: { key: 'role_permission_matrix' }
  });

  if (!existingMatrix) {
    console.log('❌ Permission matrix not found. Please run the comprehensive permissions migration first.');
    return;
  }

  const currentMatrix = JSON.parse(existingMatrix.value);

  // Update settings permissions to allow more roles
  const updatedSettingsPermissions = {
    // Basic settings access - allow PROJECT_MANAGER and BIM_MANAGER
    'view_settings': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    'edit_settings': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // Permission management - allow PROJECT_MANAGER
    'manage_permissions': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // Session management - allow PROJECT_MANAGER
    'manage_sessions': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // System logs - allow PROJECT_MANAGER and BIM_MANAGER
    'view_system_logs': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // System backup - only ADMIN
    'manage_system_backup': { 
      ADMIN: true, 
      PROJECT_MANAGER: false, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // ISO configuration - allow PROJECT_MANAGER and BIM_MANAGER
    'manage_iso_config': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // Audit logs - allow PROJECT_MANAGER
    'view_audit_logs': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // Email settings - allow PROJECT_MANAGER
    'manage_email_settings': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // Notification settings - allow PROJECT_MANAGER and BIM_MANAGER
    'manage_notification_settings': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // System statistics - allow PROJECT_MANAGER
    'view_system_statistics': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    },
    
    // System maintenance - only ADMIN
    'manage_system_maintenance': { 
      ADMIN: true, 
      PROJECT_MANAGER: false, 
      BIM_MANAGER: false, 
      CONTRIBUTOR: false, 
      VIEWER: false, 
      USER: false 
    }
  };

  // Update the matrix with new settings permissions
  const updatedMatrix = {
    ...currentMatrix,
    ...updatedSettingsPermissions
  };

  // Update the permission matrix in database
  await prisma.systemSetting.update({
    where: { key: 'role_permission_matrix' },
    data: {
      value: JSON.stringify(updatedMatrix),
      description: 'Updated role-based permission matrix with expanded settings access',
      category: 'permissions',
      updatedAt: new Date()
    }
  });

  console.log('✅ Updated settings permissions successfully!');
  console.log('📊 New settings access:');
  console.log('   - ADMIN: Full access to all settings');
  console.log('   - PROJECT_MANAGER: Access to most settings (except system backup/maintenance)');
  console.log('   - BIM_MANAGER: Access to view settings, ISO config, notifications, system logs');
  console.log('   - CONTRIBUTOR: No settings access');
  console.log('   - VIEWER: No settings access');
  console.log('   - USER: No settings access');
}

main()
  .catch((e) => {
    console.error('❌ Error updating settings permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
