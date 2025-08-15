const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking projects in database...');

  try {
    // Check if there are any projects
    const projects = await prisma.project.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
            tasks: true,
            documents: true
          }
        }
      }
    });

    console.log(`📊 Found ${projects.length} projects in database:`);
    
    if (projects.length === 0) {
      console.log('   ❌ No projects found - this might be why the user sees permission denied');
      console.log('   💡 Creating a test project...');
      
      // Create a test project
      const testProject = await prisma.project.create({
        data: {
          name: 'Test Project',
          description: 'This is a test project for permission testing',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          budget: 100000,
          priority: 'medium',
          category: 'development',
          location: 'Test Location',
          client: 'Test Client',
          manager: 'Test Manager',
          createdBy: '96c8353b-8c33-426a-8a9a-d2a25714569b' // PROJECT_MANAGER user
        }
      });
      
      console.log(`   ✅ Created test project: ${testProject.name} (ID: ${testProject.id})`);
    } else {
      projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name} (${project.status})`);
        console.log(`      📅 Created: ${project.createdAt}`);
        console.log(`      👥 Members: ${project._count.members}`);
        console.log(`      📋 Tasks: ${project._count.tasks}`);
        console.log(`      📄 Documents: ${project._count.documents}`);
      });
    }

    // Check project members
    console.log('\n👥 Checking project members:');
    const projectMembers = await prisma.projectMember.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📊 Found ${projectMembers.length} project members:`);
    projectMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.user.name} (${member.user.role}) in ${member.project.name}`);
    });

  } catch (error) {
    console.error('❌ Error checking projects:', error);
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
