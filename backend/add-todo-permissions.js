const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTodoPermissions() {
  try {
    console.log('Adding todo permissions to database...');

    // Add todo permissions
    const todoPermissions = [
      {
        code: 'view_todo',
        name: 'View Todo List',
        nameVi: 'Xem danh sách nhiệm vụ',
        description: 'Permission to view todo list',
        category: 'todo'
      },
      {
        code: 'create_todo',
        name: 'Create Todo Items',
        nameVi: 'Tạo nhiệm vụ',
        description: 'Permission to create todo items',
        category: 'todo'
      },
      {
        code: 'edit_todo',
        name: 'Edit Todo Items',
        nameVi: 'Chỉnh sửa nhiệm vụ',
        description: 'Permission to edit todo items',
        category: 'todo'
      },
      {
        code: 'delete_todo',
        name: 'Delete Todo Items',
        nameVi: 'Xóa nhiệm vụ',
        description: 'Permission to delete todo items',
        category: 'todo'
      },
      {
        code: 'complete_todo',
        name: 'Complete Todo Items',
        nameVi: 'Hoàn thành nhiệm vụ',
        description: 'Permission to complete todo items',
        category: 'todo'
      }
    ];

    // Create permissions
    for (const permission of todoPermissions) {
      const existingPermission = await prisma.permission.findUnique({
        where: { code: permission.code }
      });

      if (!existingPermission) {
        await prisma.permission.create({
          data: permission
        });
        console.log(`✅ Created permission: ${permission.code}`);
      } else {
        console.log(`⚠️ Permission already exists: ${permission.code}`);
      }
    }

    // Get all roles
    const roles = await prisma.userRole.findMany({
      where: { isActive: true }
    });

    // Get todo permissions
    const todoPerms = await prisma.permission.findMany({
      where: {
        code: {
          in: todoPermissions.map(p => p.code)
        }
      }
    });

    // Set default permissions for each role
    const rolePermissions = {
      'ADMIN': todoPerms.map(p => p.code), // Admin gets all permissions
      'PROJECT_MANAGER': ['view_todo', 'create_todo', 'edit_todo', 'complete_todo'], // PM gets most permissions
      'BIM_MANAGER': ['view_todo', 'create_todo', 'edit_todo', 'complete_todo'], // BIM Manager gets most permissions
      'CONTRIBUTOR': ['view_todo', 'create_todo', 'edit_todo', 'complete_todo'], // Contributor gets most permissions
      'VIEWER': ['view_todo'], // Viewer only gets view permission
      'USER': ['view_todo', 'create_todo', 'complete_todo'] // User gets basic permissions
    };

    // Create role permissions
    for (const role of roles) {
      const permissionsForRole = rolePermissions[role.code] || [];
      
      for (const permissionCode of permissionsForRole) {
        const permission = todoPerms.find(p => p.code === permissionCode);
        if (permission) {
          const existingRolePermission = await prisma.rolePermission.findFirst({
            where: {
              roleId: role.id,
              permissionId: permission.id
            }
          });

          if (!existingRolePermission) {
            await prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permission.id,
                granted: true
              }
            });
            console.log(`✅ Granted ${permissionCode} to ${role.code}`);
          } else {
            console.log(`⚠️ Role permission already exists: ${role.code} - ${permissionCode}`);
          }
        }
      }
    }

    console.log('✅ Todo permissions added successfully!');
  } catch (error) {
    console.error('❌ Error adding todo permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTodoPermissions();
