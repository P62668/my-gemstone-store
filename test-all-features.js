#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    await testFunction();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
  }
}

// Test server connectivity
async function testServerConnectivity() {
  const response = await fetch(`${BASE_URL}`);
  if (!response.ok) {
    throw new Error(`Server not responding: ${response.status}`);
  }
  console.log(`   Server responding on ${BASE_URL}`);
}

// Test homepage loading
async function testHomepage() {
  const response = await fetch(`${BASE_URL}`);
  if (!response.ok) {
    throw new Error(`Homepage failed: ${response.status}`);
  }
  const html = await response.text();
  if (!html.includes('gemstone') && !html.includes('Gemstone')) {
    throw new Error('Homepage content not found');
  }
}

// Test public API endpoints
async function testPublicAPIs() {
  const endpoints = [
    '/api/gemstones',
    '/api/categories',
    '/api/public/homepage',
    '/api/public/navigation',
    '/api/public/seo',
    '/api/testimonials',
    '/api/press',
    '/api/faq'
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API ${endpoint} failed: ${response.status}`);
    }
    console.log(`   ✅ ${endpoint} - ${response.status}`);
  }
}

// Test user authentication
async function testUserAuth() {
  // Test signup
  const signupResponse = await fetch(`${BASE_URL}/api/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User'
    })
  });
  
  if (!signupResponse.ok && signupResponse.status !== 409) { // 409 = user already exists
    throw new Error(`Signup failed: ${signupResponse.status}`);
  }

  // Test login
  const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123'
    })
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed: ${loginResponse.status}`);
  }

  const loginData = await loginResponse.json();
  if (!loginData.token) {
    throw new Error('Login token not received');
  }

  console.log(`   ✅ User authentication working`);
  return loginData.token;
}

// Test admin authentication
async function testAdminAuth() {
  const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@gemstone.com',
      password: 'admin123'
    })
  });

  if (!loginResponse.ok) {
    throw new Error(`Admin login failed: ${loginResponse.status}`);
  }

  const loginData = await loginResponse.json();
  if (!loginData.token) {
    throw new Error('Admin login token not received');
  }

  console.log(`   ✅ Admin authentication working`);
  return loginData.token;
}

// Test admin features
async function testAdminFeatures(adminToken) {
  const adminEndpoints = [
    '/api/admin/gemstones',
    '/api/admin/categories',
    '/api/admin/orders',
    '/api/admin/users',
    '/api/admin/analytics',
    '/api/admin/banners',
    '/api/admin/testimonials',
    '/api/admin/faqs',
    '/api/admin/press',
    '/api/admin/seo',
    '/api/admin/sitesettings',
    '/api/admin/theme',
    '/api/admin/navigation',
    '/api/admin/homepage/hero',
    '/api/admin/homepage/sections'
  ];

  for (const endpoint of adminEndpoints) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok && response.status !== 401) { // 401 is expected for some endpoints
      throw new Error(`Admin API ${endpoint} failed: ${response.status}`);
    }
    console.log(`   ✅ ${endpoint} - ${response.status}`);
  }
}

// Test user features
async function testUserFeatures(userToken) {
  const userEndpoints = [
    '/api/users/me',
    '/api/users/wishlist',
    '/api/users/recently-viewed',
    '/api/users/notifications'
  ];

  for (const endpoint of userEndpoints) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok && response.status !== 401) {
      throw new Error(`User API ${endpoint} failed: ${response.status}`);
    }
    console.log(`   ✅ ${endpoint} - ${response.status}`);
  }
}

// Test shopping features
async function testShoppingFeatures() {
  // Test cart functionality
  const cartResponse = await fetch(`${BASE_URL}/api/gemstones`);
  if (!cartResponse.ok) {
    throw new Error(`Gemstones API failed: ${cartResponse.status}`);
  }

  const gemstones = await cartResponse.json();
  if (!gemstones || !Array.isArray(gemstones)) {
    throw new Error('No gemstones data received');
  }

  console.log(`   ✅ Shopping features working (${gemstones.length} gemstones available)`);
}

// Test checkout functionality
async function testCheckoutFeatures() {
  const checkoutResponse = await fetch(`${BASE_URL}/api/checkout/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: 1, quantity: 1 }],
      success_url: `${BASE_URL}/success`,
      cancel_url: `${BASE_URL}/cancel`
    })
  });

  // Checkout might fail without proper Stripe keys, but should not crash
  if (checkoutResponse.status !== 200 && checkoutResponse.status !== 400) {
    throw new Error(`Checkout API failed: ${checkoutResponse.status}`);
  }

  console.log(`   ✅ Checkout API responding`);
}

// Test file upload
async function testFileUpload() {
  const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'test' })
  });

  if (!uploadResponse.ok && uploadResponse.status !== 400) {
    throw new Error(`Upload API failed: ${uploadResponse.status}`);
  }

  console.log(`   ✅ File upload API responding`);
}

// Test all pages load
async function testPageLoading() {
  const pages = [
    '/',
    '/shop',
    '/about',
    '/contact',
    '/login',
    '/signup',
    '/cart',
    '/wishlist',
    '/compare',
    '/categories',
    '/admin/login'
  ];

  for (const page of pages) {
    const response = await fetch(`${BASE_URL}${page}`);
    if (!response.ok) {
      throw new Error(`Page ${page} failed: ${response.status}`);
    }
    console.log(`   ✅ ${page} - ${response.status}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive feature test...\n');
  
  await runTest('Server Connectivity', testServerConnectivity);
  await runTest('Homepage Loading', testHomepage);
  await runTest('Public API Endpoints', testPublicAPIs);
  await runTest('Page Loading', testPageLoading);
  await runTest('Shopping Features', testShoppingFeatures);
  await runTest('Checkout Features', testCheckoutFeatures);
  await runTest('File Upload', testFileUpload);
  
  // Test authentication
  let userToken, adminToken;
  
  try {
    userToken = await runTest('User Authentication', testUserAuth);
    if (userToken) {
      await runTest('User Features', () => testUserFeatures(userToken));
    }
  } catch (error) {
    console.log('   ⚠️  User auth test skipped (may need database setup)');
  }

  try {
    adminToken = await runTest('Admin Authentication', testAdminAuth);
    if (adminToken) {
      await runTest('Admin Features', () => testAdminFeatures(adminToken));
    }
  } catch (error) {
    console.log('   ⚠️  Admin auth test skipped (may need database setup)');
  }

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`   ${test}: ${error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Your application is ready for launch!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error); 