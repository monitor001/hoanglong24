const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTasksEndpoint() {
  try {
    console.log('🔍 Testing tasks data from database...');
    
    // Test 1: Check if tasks exist
    const tasks = await prisma.task.findMany({
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                fileUrl: true
              }
            }
          }
        },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            comments: true,
            documents: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      take: 10
    });
    
    console.log('📊 Tasks found:', tasks.length);
    
    if (tasks.length > 0) {
      console.log('📋 Sample task:', {
        id: tasks[0].id,
        title: tasks[0].title,
        status: tasks[0].status,
        priority: tasks[0].priority,
        assignee: tasks[0].assignee?.name,
        project: tasks[0].project?.name,
        commentsCount: tasks[0]._count.comments,
        documentsCount: tasks[0]._count.documents
      });
    }
    
    // Test 2: Check task statistics
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('📈 Task statistics by status:');
    taskStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count.status}`);
    });
    
    // Test 3: Check if there are any overdue tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        AND: [
          { dueDate: { lt: new Date() } },
          { status: { notIn: ['COMPLETED'] } }
        ]
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        status: true
      }
    });
    
    console.log('⏰ Overdue tasks:', overdueTasks.length);
    if (overdueTasks.length > 0) {
      console.log('📅 Sample overdue task:', {
        title: overdueTasks[0].title,
        dueDate: overdueTasks[0].dueDate,
        status: overdueTasks[0].status
      });
    }
    
    // Test 4: Check task permissions (similar to what the controller does)
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`\n🧪 Testing task access for user: ${testUser.name} (${testUser.role})`);
      
      if (testUser.role !== 'ADMIN') {
        // Check user's project memberships
        const userProjects = await prisma.projectMember.findMany({
          where: { userId: testUser.id },
          select: { projectId: true }
        });
        
        const projectIds = userProjects.map(pm => pm.projectId);
        console.log(`📋 User has access to ${projectIds.length} projects`);
        
        if (projectIds.length > 0) {
          const accessibleTasks = await prisma.task.findMany({
            where: { projectId: { in: projectIds } },
            select: { id: true, title: true, projectId: true }
          });
          
          console.log(`📝 User can access ${accessibleTasks.length} tasks`);
        }
      } else {
        console.log('👑 Admin user - can access all tasks');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTasksEndpoint();
