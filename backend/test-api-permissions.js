const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testApiPermissions() {
  try {
    console.log('🔍 Testing API permissions...\n');

    // Find a PROJECT_MANAGER user
    const projectManagerUser = await prisma.user.findFirst({
      where: { role: 'PROJECT_MANAGER' },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!projectManagerUser) {
      console.log('❌ No PROJECT_MANAGER user found');
      return;
    }

    console.log('👤 Found PROJECT_MANAGER user:', projectManagerUser);

    // Generate a test token
    const token = jwt.sign(
      { 
        id: projectManagerUser.id, 
        email: projectManagerUser.email, 
        role: projectManagerUser.role 
      },
      process.env.JWT_SECRET || 'your_secure_jwt_secret_here',
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated test token:', token.substring(0, 50) + '...');

    // Test the API endpoint directly
    const axios = require('axios');
    
    try {
      const response = await axios.get(`http://localhost:3001/api/settings/user-permissions/${projectManagerUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ API Response:', response.data);
      
      // Check if view_tasks permission exists
      const hasViewTasks = response.data.permissions && response.data.permissions.includes('view_tasks');
      console.log('🎯 Has view_tasks permission:', hasViewTasks);
      
      if (hasViewTasks) {
        console.log('✅ API is working correctly - user has view_tasks permission');
      } else {
        console.log('❌ API is working but user does not have view_tasks permission');
      }

    } catch (apiError) {
      console.error('❌ API Error:', apiError.response?.data || apiError.message);
      
      if (apiError.response?.status === 401) {
        console.log('🔐 Authentication error - check token');
      } else if (apiError.response?.status === 403) {
        console.log('🚫 Authorization error - check permissions');
      } else if (apiError.response?.status === 404) {
        console.log('🔍 Not found error - check endpoint');
      }
    }

  } catch (error) {
    console.error('❌ Error testing API permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiPermissions();
