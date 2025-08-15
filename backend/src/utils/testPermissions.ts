import { prisma } from '../db';
import { PermissionUtils } from './permissionUtils';

const testPermissions = async () => {
  console.log('🧪 Testing permission system...\n');

  try {
    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@hoanglong24.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`👤 Testing with user: ${adminUser.name} (${adminUser.role})`);

    // Test basic permissions
    const testPermissions = [
      'dashboard_view',
      'projects_create',
      'users_view',
      'settings_edit'
    ];

    console.log('\n🔍 Testing basic permissions:');
    for (const permission of testPermissions) {
      const hasPermission = await PermissionUtils.hasPermission({
        userId: adminUser.id,
        permission
      });
      console.log(`  ${permission}: ${hasPermission ? '✅' : '❌'}`);
    }

    // Test role check
    console.log('\n🎭 Testing role checks:');
    const hasAdminRole = await PermissionUtils.hasRole({
      userId: adminUser.id,
      role: 'ADMIN'
    });
    console.log(`  ADMIN role: ${hasAdminRole ? '✅' : '❌'}`);

    const hasAnyRole = await PermissionUtils.hasAnyRole(adminUser.id, ['ADMIN', 'PROJECT_MANAGER']);
    console.log(`  Any role (ADMIN, PROJECT_MANAGER): ${hasAnyRole ? '✅' : '❌'}`);

    // Test action permissions
    console.log('\n⚡ Testing action permissions:');
    const canCreateProject = await PermissionUtils.canPerformAction(
      adminUser.id,
      'create',
      'projects'
    );
    console.log(`  Can create projects: ${canCreateProject ? '✅' : '❌'}`);

    const canEditUsers = await PermissionUtils.canPerformAction(
      adminUser.id,
      'edit',
      'users'
    );
    console.log(`  Can edit users: ${canEditUsers ? '✅' : '❌'}`);

    // Test cache functionality
    console.log('\n💾 Testing cache functionality:');
    const cacheStats = PermissionUtils.getCacheStats();
    console.log(`  Cache stats: ${JSON.stringify(cacheStats, null, 2)}`);

    // Test permission validation
    console.log('\n✅ Testing permission validation:');
    const validPermission = PermissionUtils.isValidPermissionCode('projects_create');
    console.log(`  Valid permission 'projects_create': ${validPermission ? '✅' : '❌'}`);

    const invalidPermission = PermissionUtils.isValidPermissionCode('invalid-permission');
    console.log(`  Invalid permission 'invalid-permission': ${invalidPermission ? '✅' : '❌'}`);

    // Test permission levels
    console.log('\n📊 Testing permission levels:');
    const viewLevel = PermissionUtils.getPermissionLevel('projects_view');
    console.log(`  'projects_view' level: ${viewLevel}`);

    const createLevel = PermissionUtils.getPermissionLevel('projects_create');
    console.log(`  'projects_create' level: ${createLevel}`);

    const deleteLevel = PermissionUtils.getPermissionLevel('projects_delete');
    console.log(`  'projects_delete' level: ${deleteLevel}`);

    // Test getting all permissions
    console.log('\n📋 Testing get all permissions:');
    const allPermissions = await PermissionUtils.getAllPermissions(adminUser.id);
    console.log(`  Total permissions: ${allPermissions.length}`);
    console.log(`  Sample permissions: ${allPermissions.slice(0, 5).join(', ')}`);

    console.log('\n🎉 Permission system test completed successfully!');

  } catch (error) {
    console.error('❌ Permission test failed:', error);
  }
};

// Run if called directly
if (require.main === module) {
  testPermissions()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}
