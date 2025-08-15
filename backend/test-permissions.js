const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPermissions() {
  try {
    console.log('🔍 Testing permissions data...');
    
    // Test 1: Check if users exist
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('📊 Users found:', users.length);
    console.log('👥 Sample users:', users.slice(0, 3));
    
    // Test 2: Check if roles exist
    const roles = await prisma.userRole.findMany({
      where: { isActive: true }
    });
    console.log('🎭 Roles found:', roles.length);
    console.log('🎪 Available roles:', roles.map(r => ({ code: r.code, name: r.name })));
    
    // Test 3: Check if permissions exist
    const permissions = await prisma.permission.findMany({
      where: { isActive: true }
    });
    console.log('🔐 Permissions found:', permissions.length);
    console.log('🔑 Sample permissions:', permissions.slice(0, 5).map(p => ({ code: p.code, name: p.name })));
    
    // Test 4: Check role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { granted: true },
      include: {
        role: true,
        permission: true
      }
    });
    console.log('🔗 Role permissions found:', rolePermissions.length);
    
    // Test 5: Test specific user permissions
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 Testing permissions for user: ${testUser.name} (${testUser.email})`);
      
      // Get user's role permissions
      const userRolePermissions = await prisma.rolePermission.findMany({
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
      
      console.log(`📋 User role permissions for ${testUser.role}:`, userRolePermissions.length);
      console.log('🔑 User permissions:', userRolePermissions.map(rp => rp.permission.code));
      
      // Test alternative method
      const allRoles = await prisma.userRole.findMany({
        where: { isActive: true }
      });
      
      const matchingRole = allRoles.find(r => 
        r.code.toLowerCase() === testUser.role.toLowerCase() ||
        r.name.toLowerCase() === testUser.role.toLowerCase()
      );
      
      if (matchingRole) {
        console.log(`✅ Found matching role: ${matchingRole.name} (${matchingRole.code})`);
        
        const altPermissions = await prisma.rolePermission.findMany({
          where: {
            roleId: matchingRole.id,
            granted: true,
            permission: { isActive: true }
          },
          include: {
            permission: true
          }
        });
        
        console.log(`🔑 Alternative method permissions:`, altPermissions.length);
        console.log('📝 Permissions:', altPermissions.map(rp => rp.permission.code));
      } else {
        console.log(`❌ No matching role found for: ${testUser.role}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPermissions();
