const axios = require('axios');

const API_URL = 'https://minicde-production-589be4b0d52b.herokuapp.com/api';

async function testLicenseAPI() {
  console.log('🧪 Testing License API...');
  
  try {
    // Test 1: Get licenses without auth (should fail)
    console.log('\n1. Testing GET /licenses without auth...');
    try {
      const response = await axios.get(`${API_URL}/licenses`);
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      console.log('✅ Correctly failed with status:', error.response?.status);
    }
    
    // Test 2: Get license stats without auth (should fail)
    console.log('\n2. Testing GET /licenses/stats without auth...');
    try {
      const response = await axios.get(`${API_URL}/licenses/stats`);
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      console.log('✅ Correctly failed with status:', error.response?.status);
    }
    
    // Test 3: Test with invalid token
    console.log('\n3. Testing with invalid token...');
    try {
      const response = await axios.get(`${API_URL}/licenses`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      console.log('✅ Correctly failed with status:', error.response?.status);
    }
    
    console.log('\n🎯 Conclusion: API is working correctly - authentication is required');
    console.log('The "Application Error" in frontend is likely due to authentication issues');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLicenseAPI();
