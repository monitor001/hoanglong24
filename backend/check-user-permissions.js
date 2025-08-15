const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserPermissions() {
  try {
    console.log('🔍 Checking user permissions...\n');

    // Find a PROJECT_MANAGER user
    const projectManagerUser = await prisma.user.findFirst({
      where: { role: 'PROJECT_MANAGER' },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!projectManagerUser) {
      console.log('❌ No PROJECT_MANAGER user found');
      return;
    }

    console.log('👤 Found PROJECT_MANAGER user:', projectManagerUser);

    // Check user's role permissions using PermissionUtils logic
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: {
          code: projectManagerUser.role
        },
        granted: true,
        permission: { isActive: true }
      },
      include: {
        permission: true
      }
    });

    console.log('\n🔑 User role permissions found:', rolePermissions.length);

    // Check if user has view_tasks permission
    const hasViewTasks = rolePermissions.some(rp => rp.permission.code === 'view_tasks');
    console.log('🎯 User has view_tasks permission:', hasViewTasks ? '✅ YES' : '❌ NO');

    if (hasViewTasks) {
      const viewTasksPermission = rolePermissions.find(rp => rp.permission.code === 'view_tasks');
      console.log('📋 view_tasks permission details:', {
        permissionId: viewTasksPermission.permission.id,
        permissionCode: viewTasksPermission.permission.code,
        permissionName: viewTasksPermission.permission.name,
        granted: viewTasksPermission.granted
      });
    }

    // Check all task-related permissions for this user
    const taskPermissions = rolePermissions.filter(rp => 
      rp.permission.code.includes('task') || rp.permission.code.includes('Task')
    );

    console.log('\n📋 All task permissions for this user:');
    taskPermissions.forEach(rp => {
      console.log(`  - ${rp.permission.code}: ${rp.permission.name} (${rp.granted ? '✅ Granted' : '❌ Denied'})`);
    });

    // Test the exact query that frontend uses
    console.log('\n🔍 Testing frontend permission query...');
    
    // Simulate the frontend permission check
    const userPermissions = rolePermissions.map(rp => rp.permission.code);
    console.log('📝 User permissions array:', userPermissions);
    
    const canViewTasks = userPermissions.includes('view_tasks');
    console.log('🎯 canViewTasks result:', canViewTasks ? '✅ TRUE' : '❌ FALSE');

  } catch (error) {
    console.error('❌ Error checking user permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPermissions();
