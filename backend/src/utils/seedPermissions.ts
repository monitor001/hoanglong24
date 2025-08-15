import { prisma } from '../db';
import { comprehensivePermissions, roles, categories } from './comprehensivePermissions';

export async function seedPermissionsAndRoles() {
  try {
    console.log('Starting permission and role seeding...');

    // Create roles
    const createdRoles: { [key: string]: any } = {};
    
    for (const role of roles) {
      const createdRole = await prisma.userRole.upsert({
        where: { code: role.id },
        update: {
          name: role.name,
          nameVi: role.nameVi,
          color: role.color,
          description: role.description,
          isActive: true
        },
        create: {
          code: role.id,
          name: role.name,
          nameVi: role.nameVi,
          color: role.color,
          description: role.description,
          isActive: true
        }
      });
      createdRoles[role.id] = createdRole;
      console.log(`Created/Updated role: ${role.name}`);
    }

    // Create permissions
    const createdPermissions: { [key: string]: any } = {};
    
    for (const permission of comprehensivePermissions) {
      const createdPermission = await prisma.permission.upsert({
        where: { code: permission.id },
        update: {
          name: permission.name,
          nameVi: permission.nameVi,
          description: permission.description,
          category: permission.category,
          isActive: true
        },
        create: {
          code: permission.id,
          name: permission.name,
          nameVi: permission.nameVi,
          description: permission.description,
          category: permission.category,
          isActive: true
        }
      });
      createdPermissions[permission.id] = createdPermission;
      console.log(`Created/Updated permission: ${permission.name}`);
    }

    // Create default permission matrix based on comprehensivePermissions
    const defaultMatrix: { [key: string]: { [key: string]: boolean } } = {};
    
    // Initialize matrix with all permissions and roles
    for (const permission of comprehensivePermissions) {
      defaultMatrix[permission.id] = {};
      for (const role of roles) {
        defaultMatrix[permission.id][role.id] = false;
      }
    }

    // Set default permissions based on role hierarchy
    for (const permission of comprehensivePermissions) {
      const permissionCode = permission.id;
      
      // Admin has all permissions
      defaultMatrix[permissionCode]['ADMIN'] = true;
      
      // Set permissions based on category and action
      const [action, resource] = permissionCode.split('_');
      
      switch (resource) {
        case 'dashboard':
          defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
          defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
          defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
          defaultMatrix[permissionCode]['VIEWER'] = true;
          break;
          
        case 'projects':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
            defaultMatrix[permissionCode]['VIEWER'] = true;
          } else if (action === 'create' || action === 'edit') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
          }
          break;
          
        case 'tasks':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
            defaultMatrix[permissionCode]['VIEWER'] = true;
          } else if (action === 'create' || action === 'edit') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
          }
          break;
          
        case 'issues':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
            defaultMatrix[permissionCode]['VIEWER'] = true;
          } else if (action === 'create' || action === 'edit') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
          }
          break;
          
        case 'documents':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
            defaultMatrix[permissionCode]['VIEWER'] = true;
          } else if (action === 'create' || action === 'edit') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
          }
          break;
          
        case 'calendar':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
            defaultMatrix[permissionCode]['VIEWER'] = true;
          } else if (action === 'create' || action === 'edit') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
          }
          break;
          
        case 'notes':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
            defaultMatrix[permissionCode]['VIEWER'] = true;
          } else if (action === 'create' || action === 'edit') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
          }
          break;
          
        case 'approvals':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
            defaultMatrix[permissionCode]['CONTRIBUTOR'] = true;
          } else if (action === 'create' || action === 'edit' || action === 'approve') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
          }
          break;
          
        case 'users':
          // Only admin can manage users
          break;
          
        case 'settings':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
          }
          // Only admin can edit/manage settings
          break;
          
        case 'reports':
          if (action === 'view') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
            defaultMatrix[permissionCode]['BIM_MANAGER'] = true;
          } else if (action === 'create' || action === 'export') {
            defaultMatrix[permissionCode]['PROJECT_MANAGER'] = true;
          }
          break;
      }
    }

    // Create role permissions with batch processing
    const upsertOperations = [];
    
    for (const permissionCode in defaultMatrix) {
      const permission = createdPermissions[permissionCode];
      if (!permission) continue;
      
      for (const roleCode in defaultMatrix[permissionCode]) {
        const role = createdRoles[roleCode];
        if (!role) continue;
        
        const isGranted = defaultMatrix[permissionCode][roleCode];
        
        upsertOperations.push(
          prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {
              granted: isGranted
            },
            create: {
              roleId: role.id,
              permissionId: permission.id,
              granted: isGranted
            }
          })
        );
      }
    }

    // Execute batch operations
    if (upsertOperations.length > 0) {
      console.log(`Creating ${upsertOperations.length} role permissions...`);
      await prisma.$transaction(upsertOperations);
      console.log('Role permissions created successfully');
    }

    // Update system setting with the new matrix
    await prisma.systemSetting.upsert({
      where: { key: 'role_permission_matrix' },
      update: {
        value: JSON.stringify(defaultMatrix),
        description: 'Role-based permission matrix from database',
        category: 'permissions',
        isActive: true
      },
      create: {
        key: 'role_permission_matrix',
        value: JSON.stringify(defaultMatrix),
        description: 'Role-based permission matrix from database',
        category: 'permissions',
        isActive: true
      }
    });

    console.log('Permission and role seeding completed successfully!');
    console.log(`Created ${Object.keys(createdRoles).length} roles`);
    console.log(`Created ${Object.keys(createdPermissions).length} permissions`);
    
  } catch (error) {
    console.error('Error seeding permissions and roles:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedPermissionsAndRoles()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
