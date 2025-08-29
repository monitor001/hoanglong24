const axios = require('axios');

const API_URL = 'https://minicde-production-589be4b0d52b.herokuapp.com/api';
const FRONTEND_URL = 'https://minicde-frontend-833302d6ab3c.herokuapp.com';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  try {
    // Test 1: Check if login page is accessible
    console.log('1. Testing login page accessibility...');
    try {
      const response = await axios.get(`${FRONTEND_URL}/login`);
      console.log('✅ Login page is accessible');
    } catch (error) {
      console.log('❌ Login page error:', error.response?.status);
    }
    
    // Test 2: Test login with invalid credentials
    console.log('\n2. Testing login with invalid credentials...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      console.log('✅ Correctly failed with status:', error.response?.status);
      console.log('   Error message:', error.response?.data?.error || 'Unknown error');
    }
    
    // Test 3: Test login with valid credentials (if available)
    console.log('\n3. Testing login with valid credentials...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      if (response.data.token) {
        console.log('✅ Login successful');
        console.log('   Token received:', response.data.token ? 'Yes' : 'No');
        console.log('   User info:', response.data.user?.name || 'No user info');
        
        // Test 4: Test protected endpoint with valid token
        console.log('\n4. Testing protected endpoint with valid token...');
        try {
          const protectedResponse = await axios.get(`${API_URL}/licenses`, {
            headers: {
              'Authorization': `Bearer ${response.data.token}`
            }
          });
          console.log('✅ Protected endpoint accessible with token');
          console.log('   Status:', protectedResponse.status);
        } catch (error) {
          console.log('❌ Protected endpoint failed:', error.response?.status);
        }
      } else if (response.data.requireTwoFactor) {
        console.log('✅ Login requires 2FA');
        console.log('   User ID:', response.data.userId);
      }
    } catch (error) {
      console.log('❌ Login failed:', error.response?.status);
      console.log('   Error message:', error.response?.data?.error || 'Unknown error');
    }
    
    // Test 5: Test without token
    console.log('\n5. Testing protected endpoint without token...');
    try {
      const response = await axios.get(`${API_URL}/licenses`);
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      console.log('✅ Correctly failed with status:', error.response?.status);
    }
    
    console.log('\n🎯 Authentication Flow Test Summary:');
    console.log('- Login page should be accessible');
    console.log('- Invalid credentials should be rejected');
    console.log('- Valid credentials should work (or require 2FA)');
    console.log('- Protected endpoints should require authentication');
    console.log('- Token should provide access to protected endpoints');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow();
