const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Creating test users with different roles...');

  const testUsers = [
    {
      email: 'projectmanager@test.com',
      password: 'pm123',
      name: 'Project Manager Test',
      role: 'PROJECT_MANAGER',
      organization: 'Test Organization'
    },
    {
      email: 'bimmanager@test.com',
      password: 'bim123',
      name: 'BIM Manager Test',
      role: 'BIM_MANAGER',
      organization: 'Test Organization'
    },
    {
      email: 'contributor@test.com',
      password: 'contrib123',
      name: 'Contributor Test',
      role: 'CONTRIBUTOR',
      organization: 'Test Organization'
    },
    {
      email: 'viewer@test.com',
      password: 'viewer123',
      name: 'Viewer Test',
      role: 'VIEWER',
      organization: 'Test Organization'
    }
  ];

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists (${userData.role})`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
          status: 'active',
          organization: userData.organization
        }
      });

      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
  }

  console.log('\n📊 Test users created:');
  console.log('   - projectmanager@test.com / pm123 (PROJECT_MANAGER)');
  console.log('   - bimmanager@test.com / bim123 (BIM_MANAGER)');
  console.log('   - contributor@test.com / contrib123 (CONTRIBUTOR)');
  console.log('   - viewer@test.com / viewer123 (VIEWER)');
  console.log('\n🔐 Settings access:');
  console.log('   - PROJECT_MANAGER: Can access most settings');
  console.log('   - BIM_MANAGER: Can access view settings, ISO config, notifications, system logs');
  console.log('   - CONTRIBUTOR: No settings access');
  console.log('   - VIEWER: No settings access');
}

main()
  .catch((e) => {
    console.error('❌ Error creating test users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
