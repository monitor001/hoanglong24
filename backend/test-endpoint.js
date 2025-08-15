const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🔍 Testing /settings/user-permissions endpoint...');
    
    // Test 1: Test without authentication
    try {
      const response1 = await axios.get('http://localhost:5000/api/settings/user-permissions/test-user-id');
      console.log('❌ Should fail without auth:', response1.status);
    } catch (error) {
      console.log('✅ Correctly failed without auth:', error.response?.status);
    }
    
    // Test 2: Test with authentication (you'll need to get a valid token)
    console.log('\n📝 To test with authentication, you need to:');
    console.log('1. Login to get a token');
    console.log('2. Use the token in Authorization header');
    console.log('3. Test the endpoint');
    
    // Test 3: Check if server is running
    try {
      const healthCheck = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running on port 5000');
      console.log('Please start the server with: npm run dev');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testEndpoint();
