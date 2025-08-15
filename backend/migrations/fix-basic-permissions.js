const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fixing basic permissions for all roles...');

  // Get existing permission matrix
  const existingMatrix = await prisma.systemSetting.findUnique({
    where: { key: 'role_permission_matrix' }
  });

  if (!existingMatrix) {
    console.log('❌ Permission matrix not found. Creating new one...');
  }

  // Define basic permissions that all roles should have
  const basicPermissions = {
    // Dashboard - All roles can view
    'dashboard_view': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Projects - Basic access for all roles
    'view_projects': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    'view_project_details': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Tasks - Basic access for all roles
    'view_tasks': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Documents - Basic access for all roles
    'view_documents': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Issues - Basic access for all roles
    'view_issues': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Notes - Basic access for all roles
    'view_notes': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Calendar - Basic access for all roles
    'view_calendar': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Todo - Basic access for all roles
    'view_todo_list': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Design Checklist - Basic access for all roles
    'view_design_checklist': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    },
    
    // Approval - Basic access for all roles
    'view_approvals': { 
      ADMIN: true, 
      PROJECT_MANAGER: true, 
      BIM_MANAGER: true, 
      CONTRIBUTOR: true, 
      VIEWER: true, 
      USER: true 
    }
  };

  // Create or update permission matrix
  let currentMatrix = {};
  if (existingMatrix) {
    currentMatrix = JSON.parse(existingMatrix.value);
    console.log('📝 Updating existing permission matrix...');
  } else {
    console.log('📝 Creating new permission matrix...');
  }

  // Merge basic permissions with existing matrix
  const updatedMatrix = {
    ...currentMatrix,
    ...basicPermissions
  };

  // Save to database
  if (existingMatrix) {
    await prisma.systemSetting.update({
      where: { key: 'role_permission_matrix' },
      data: {
        value: JSON.stringify(updatedMatrix),
        description: 'Updated permission matrix with basic access for all roles',
        category: 'permissions',
        updatedAt: new Date()
      }
    });
  } else {
    await prisma.systemSetting.create({
      data: {
        key: 'role_permission_matrix',
        value: JSON.stringify(updatedMatrix),
        description: 'Permission matrix with basic access for all roles',
        category: 'permissions',
        isActive: true
      }
    });
  }

  console.log('✅ Fixed basic permissions successfully!');
  console.log('📊 Basic access granted to all roles:');
  console.log('   - Dashboard view');
  console.log('   - Project view');
  console.log('   - Task view');
  console.log('   - Document view');
  console.log('   - Issue view');
  console.log('   - Note view');
  console.log('   - Calendar view');
  console.log('   - Todo list view');
  console.log('   - Design checklist view');
  console.log('   - Approval view');
  console.log('\n🔐 Now all users should be able to access basic features!');
}

main()
  .catch((e) => {
    console.error('❌ Error fixing basic permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
