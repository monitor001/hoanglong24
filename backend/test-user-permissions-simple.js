const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserPermissionsSimple() {
  try {
    console.log('🔍 Testing user permissions logic...');
    
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
    
    // Test 2: Get user's role permissions (same logic as PermissionUtils)
    console.log('\n📋 Testing role permissions logic...');
    
    // Method 1: Get role permissions using role code
    let rolePermissions = await prisma.rolePermission.findMany({
      where: {
        role: {
          code: testUser.role
        },
        granted: true,
        permission: { isActive: true }
      },
      include: {
        permission: true
      }
    });
    
    console.log(`✅ Method 1 - Role permissions for ${testUser.role}:`, rolePermissions.length);
    
    // Method 2: If no permissions found, try using role name directly
    if (rolePermissions.length === 0) {
      rolePermissions = await prisma.rolePermission.findMany({
        where: {
          role: {
            name: testUser.role
          },
          granted: true,
          permission: { isActive: true }
        },
        include: {
          permission: true
        }
      });
      console.log(`✅ Method 2 - Role permissions for ${testUser.role}:`, rolePermissions.length);
    }
    
    // Method 3: If still no permissions, try case-insensitive search
    if (rolePermissions.length === 0) {
      const allRoles = await prisma.userRole.findMany({
        where: { isActive: true }
      });
      
      const matchingRole = allRoles.find(r => 
        r.code.toLowerCase() === testUser.role.toLowerCase() ||
        r.name.toLowerCase() === testUser.role.toLowerCase()
      );
      
      if (matchingRole) {
        rolePermissions = await prisma.rolePermission.findMany({
          where: {
            roleId: matchingRole.id,
            granted: true,
            permission: { isActive: true }
          },
          include: {
            permission: true
          }
        });
        console.log(`✅ Method 3 - Role permissions for ${matchingRole.name}:`, rolePermissions.length);
      }
    }
    
    // Extract permission codes
    const permissions = rolePermissions.map(rp => rp.permission.code);
    
    // Test 3: Test the response format
    const responseFormat = {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        organization: testUser.organization
      },
      permissions: permissions
    };
    
    console.log('\n📤 Response format:');
    console.log('✅ User object:', responseFormat.user);
    console.log(`✅ Permissions array length: ${responseFormat.permissions.length}`);
    console.log('✅ Has permissions property:', 'permissions' in responseFormat);
    
    // Test 4: Check if specific permissions exist
    const importantPermissions = ['view_tasks', 'create_tasks', 'edit_tasks', 'view_projects'];
    console.log('\n🔍 Checking important permissions:');
    importantPermissions.forEach(permission => {
      const hasPermission = permissions.includes(permission);
      console.log(`  ${permission}: ${hasPermission ? '✅' : '❌'}`);
    });
    
    console.log('\n🎯 Summary:');
    console.log(`- User: ${testUser.name} (${testUser.role})`);
    console.log(`- Total permissions: ${permissions.length}`);
    console.log(`- Can view tasks: ${permissions.includes('view_tasks') ? 'Yes' : 'No'}`);
    console.log(`- Can create tasks: ${permissions.includes('create_tasks') ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error testing user permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserPermissionsSimple();
