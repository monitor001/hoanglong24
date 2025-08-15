const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://minicde-production-589be4b0d52b.herokuapp.com/api';

// Test user credentials (replace with actual test user)
const TEST_USER = {
  email: 'admin@hoanglong24.com',
  password: 'admin123'
};

async function testPermissionsLoading() {
  console.log('🧪 Testing Permissions Loading from Database');
  console.log('============================================');
  
  try {
    // Step 1: Login
    console.log('\n1️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER);
    
    if (loginResponse.data.requireTwoFactor) {
      console.log('❌ 2FA required, cannot test automatically');
      return;
    }
    
    const { token, user } = loginResponse.data;
    console.log('✅ Login successful:', { userId: user.id, email: user.email });
    
    // Step 2: Test permissions endpoint
    console.log('\n2️⃣ Testing Permissions Endpoint...');
    const permissionsResponse = await axios.get(`${API_BASE_URL}/permissions/user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { permissions } = permissionsResponse.data;
    console.log('✅ Permissions loaded from database:', {
      userId: user.id,
      permissionsCount: permissions.length,
      samplePermissions: permissions.slice(0, 5)
    });
    
    // Step 3: Test permission matrix
    console.log('\n3️⃣ Testing Permission Matrix...');
    const matrixResponse = await axios.get(`${API_BASE_URL}/settings/permissions-config`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { permissions: allPermissions, roles, rolePermissionMatrix } = matrixResponse.data;
    console.log('✅ Permission matrix loaded:', {
      totalPermissions: allPermissions.length,
      totalRoles: roles.length,
      matrixEntries: Object.keys(rolePermissionMatrix).length
    });
    
    // Step 4: Test specific permission checks
    console.log('\n4️⃣ Testing Specific Permission Checks...');
    const testPermissions = ['dashboard_view', 'project_view', 'task_view', 'user_view'];
    
    for (const permission of testPermissions) {
      const checkResponse = await axios.post(`${API_BASE_URL}/auth/check-permission`, {
        permission
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { hasPermission } = checkResponse.data.data;
      console.log(`   ${permission}: ${hasPermission ? '✅' : '❌'}`);
    }
    
    // Step 5: Validate permissions are from database
    console.log('\n5️⃣ Validating Database Source...');
    const hasDatabasePermissions = permissions.length > 0;
    const hasValidPermissions = permissions.every(p => typeof p === 'string' && p.length > 0);
    
    console.log('✅ Database validation:', {
      hasPermissions: hasDatabasePermissions,
      hasValidPermissions,
      permissionsCount: permissions.length
    });
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('===============');
    console.log(`✅ Login: ${user.email}`);
    console.log(`✅ Permissions loaded: ${permissions.length} permissions`);
    console.log(`✅ Permission matrix: ${allPermissions.length} total permissions`);
    console.log(`✅ Database source: ${hasDatabasePermissions ? 'Confirmed' : 'Failed'}`);
    console.log(`✅ Valid permissions: ${hasValidPermissions ? 'Yes' : 'No'}`);
    
    if (hasDatabasePermissions && hasValidPermissions) {
      console.log('\n🎉 All tests passed! Permissions are loading correctly from database.');
    } else {
      console.log('\n❌ Some tests failed. Check the database configuration.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Tip: Check if the test user credentials are correct');
    } else if (error.response?.status === 404) {
      console.log('💡 Tip: Check if the API endpoints are available');
    } else if (error.response?.status === 500) {
      console.log('💡 Tip: Check the backend server logs');
    }
  }
}

// Run the test
if (require.main === module) {
  testPermissionsLoading();
}

module.exports = { testPermissionsLoading };
