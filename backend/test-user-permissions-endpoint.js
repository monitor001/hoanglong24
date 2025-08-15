const { PrismaClient } = require('@prisma/client');
const { PermissionUtils } = require('./src/utils/permissionUtils.ts');

const prisma = new PrismaClient();

async function testUserPermissionsEndpoint() {
  try {
    console.log('🔍 Testing user permissions endpoint logic...');
    
    // Test 1: Get a user
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    const testUser = users[0];
    console.log(`🧪 Testing with user: ${testUser.name} (${testUser.email})`);
    
    // Test 2: Test PermissionUtils.getAllPermissions
    console.log('\n📋 Testing PermissionUtils.getAllPermissions...');
    const userPermissions = await PermissionUtils.getAllPermissions(testUser.id);
    console.log(`✅ User permissions count: ${userPermissions.length}`);
    console.log('🔑 Sample permissions:', userPermissions.slice(0, 10));
    
    // Test 3: Test the response format that would be sent
    const responseFormat = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        organization: testUser.organization
      },
      permissions: userPermissions
    };
    
    console.log('\n📤 Response format:');
    console.log('✅ User object:', responseFormat.user);
    console.log(`✅ Permissions array length: ${responseFormat.permissions.length}`);
    console.log('✅ Has permissions property:', 'permissions' in responseFormat);
    
    // Test 4: Check if specific permissions exist
    const importantPermissions = ['view_tasks', 'create_tasks', 'edit_tasks', 'view_projects'];
    console.log('\n🔍 Checking important permissions:');
    importantPermissions.forEach(permission => {
      const hasPermission = userPermissions.includes(permission);
      console.log(`  ${permission}: ${hasPermission ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing user permissions endpoint:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserPermissionsEndpoint();
