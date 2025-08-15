const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking permission matrix in database...');

  try {
    // Get permission matrix from database
    const permissionMatrix = await prisma.systemSetting.findUnique({
      where: { key: 'role_permission_matrix' }
    });

    if (!permissionMatrix) {
      console.log('❌ Permission matrix not found in database');
      return;
    }

    const matrix = JSON.parse(permissionMatrix.value);
    console.log('✅ Permission matrix found in database');

    // Check specific permissions for PROJECT_MANAGER
    const projectManagerPermissions = [];
    const allPermissions = Object.keys(matrix);

    console.log('\n📊 Checking PROJECT_MANAGER permissions:');
    for (const permission of allPermissions) {
      if (matrix[permission] && matrix[permission].PROJECT_MANAGER === true) {
        projectManagerPermissions.push(permission);
        console.log(`   ✅ ${permission}`);
      }
    }

    console.log(`\n📈 Total permissions for PROJECT_MANAGER: ${projectManagerPermissions.length}`);
    
    // Check specific important permissions
    const importantPermissions = [
      'dashboard_view',
      'view_projects',
      'view_tasks',
      'view_documents',
      'view_issues',
      'view_notes',
      'view_calendar',
      'view_todo_list',
      'view_design_checklist',
      'view_approvals',
      'view_settings'
    ];

    console.log('\n🎯 Important permissions check:');
    for (const permission of importantPermissions) {
      const hasPermission = matrix[permission] && matrix[permission].PROJECT_MANAGER === true;
      console.log(`   ${hasPermission ? '✅' : '❌'} ${permission}: ${hasPermission ? 'GRANTED' : 'DENIED'}`);
    }

    // Check user in database
    console.log('\n👤 Checking user in database:');
    const user = await prisma.user.findUnique({
      where: { email: 'projectmanager@test.com' }
    });

    if (user) {
      console.log(`   ✅ User found: ${user.name} (${user.role})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏢 Organization: ${user.organization}`);
      console.log(`   📅 Created: ${user.createdAt}`);
      console.log(`   🔄 Last login: ${user.lastLogin}`);
    } else {
      console.log('   ❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error checking permissions:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
