import { prisma } from '../db';
import bcrypt from 'bcryptjs';

export const createDefaultAdmin = async () => {
  try {
    console.log('🔧 Creating default admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@hoanglong24.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@hoanglong24.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
        status: 'active',
        organization: 'Hoang Long 24',
        department: 'IT'
      }
    });

    console.log('✅ Default admin user created successfully');
    console.log('📧 Email: admin@hoanglong24.com');
    console.log('🔑 Password: admin123');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  createDefaultAdmin()
    .then(() => {
      console.log('🎉 Admin setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin setup failed:', error);
      process.exit(1);
    });
}
