const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing API with real token...');

  try {
    // Get a user
    const user = await prisma.user.findFirst({
      where: { status: 'active' }
    });

    if (!user) {
      console.log('❌ No active user found');
      return;
    }

    console.log(`👤 Using user: ${user.email} (${user.role})`);

    // Generate a token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      'VGXg77TJdBVXX6Y8l8qQShv/9MjbOksW8Nb883nBT38=',
      { expiresIn: '1h' }
    );

    console.log(`🔑 Generated token: ${token.substring(0, 20)}...`);

    // Test API endpoints
    const baseURL = 'https://minicde-production-589be4b0d52b.herokuapp.com';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test projects API
    console.log('\n📋 Testing /api/projects...');
    try {
      const projectsResponse = await axios.get(`${baseURL}/api/projects`, { headers });
      console.log('✅ Projects API response:', projectsResponse.status, projectsResponse.data);
    } catch (error) {
      console.log('❌ Projects API error:', error.response?.status, error.response?.data);
    }

    // Test notes API
    console.log('\n📝 Testing /api/notes...');
    try {
      const notesResponse = await axios.get(`${baseURL}/api/notes`, { headers });
      console.log('✅ Notes API response:', notesResponse.status, notesResponse.data);
    } catch (error) {
      console.log('❌ Notes API error:', error.response?.status, error.response?.data);
    }

    // Test tasks API
    console.log('\n✅ Testing /api/tasks...');
    try {
      const tasksResponse = await axios.get(`${baseURL}/api/tasks`, { headers });
      console.log('✅ Tasks API response:', tasksResponse.status, tasksResponse.data);
    } catch (error) {
      console.log('❌ Tasks API error:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
