const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking users and permissions...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    console.log('\n👥 Users in database:');
    users.forEach(user => {
      console.log(`   ${user.email} - Role: ${user.role} - Status: ${user.status}`);
    });

    // Get permission matrix
    const permissionMatrix = await prisma.systemSetting.findUnique({
      where: { key: 'role_permission_matrix' }
    });

    if (permissionMatrix) {
      const matrix = JSON.parse(permissionMatrix.value);
      console.log('\n📊 Permission matrix found');
      
      // Check view_notes permission for each role
      console.log('\n🎯 view_notes permission by role:');
      if (matrix.view_notes) {
        Object.entries(matrix.view_notes).forEach(([role, hasPermission]) => {
          console.log(`   ${role}: ${hasPermission ? '✅' : '❌'}`);
        });
      } else {
        console.log('   ❌ view_notes permission not found in matrix');
      }
    } else {
      console.log('\n❌ Permission matrix not found');
    }

    // Check active sessions
    const activeSessions = await prisma.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    console.log('\n🔐 Active sessions:');
    activeSessions.forEach(session => {
      console.log(`   User: ${session.user.email} (${session.user.role}) - Session ID: ${session.id}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
