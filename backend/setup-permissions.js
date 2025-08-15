const { PrismaClient } = require('@prisma/client');
const { SetupOptimizedPermissions } = require('./dist/utils/setupOptimizedPermissions');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting optimized permission system setup...');
    
    // Setup complete permission system
    await SetupOptimizedPermissions.setupComplete();
    
    console.log('✅ Permission system setup completed successfully!');
    
    // Verify setup
    const permissions = await prisma.permission.count();
    const roles = await prisma.userRole.count();
    const rolePermissions = await prisma.rolePermission.count();
    
    console.log('\n📊 Setup Summary:');
    console.log(`- Permissions created: ${permissions}`);
    console.log(`- User roles created: ${roles}`);
    console.log(`- Role permissions assigned: ${rolePermissions}`);
    
    // Show role details
    const allRoles = await prisma.userRole.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    console.log('\n👥 Role Details:');
    for (const role of allRoles) {
      console.log(`\n${role.name} (${role.code}):`);
      console.log(`  Description: ${role.description}`);
      console.log(`  Permissions: ${role.rolePermissions.length}`);
      
      // Group permissions by category
      const permissionsByCategory = {};
      for (const rp of role.rolePermissions) {
        const category = rp.permission.category;
        if (!permissionsByCategory[category]) {
          permissionsByCategory[category] = [];
        }
        permissionsByCategory[category].push(rp.permission.name);
      }
      
      for (const [category, perms] of Object.entries(permissionsByCategory)) {
        console.log(`  ${category}: ${perms.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error setting up permission system:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'reset') {
  console.log('🔄 Resetting permission system...');
  SetupOptimizedPermissions.resetPermissionSystem()
    .then(() => {
      console.log('✅ Permission system reset completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error resetting permission system:', error);
      process.exit(1);
    });
} else if (command === 'verify') {
  console.log('🔍 Verifying permission system...');
  main()
    .then(() => {
      console.log('✅ Permission system verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error verifying permission system:', error);
      process.exit(1);
    });
} else {
  // Default: setup
  main()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}
