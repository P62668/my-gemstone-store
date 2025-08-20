const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

// Comprehensive test configuration
const tests = [
  // API Endpoints
  { name: 'Health API', method: 'GET', path: '/api/health', expectedStatus: 200 },
  { name: 'Gemstones API', method: 'GET', path: '/api/gemstones', expectedStatus: 200 },
  { name: 'Categories API', method: 'GET', path: '/api/categories', expectedStatus: 200 },
  { name: 'FAQ API', method: 'GET', path: '/api/faq', expectedStatus: 200 },
  { name: 'Testimonials API', method: 'GET', path: '/api/testimonials', expectedStatus: 200 },
  { name: 'Press API', method: 'GET', path: '/api/press', expectedStatus: 200 },
  { name: 'Cart API', method: 'GET', path: '/api/cart', expectedStatus: 200 },
  { name: 'Wishlist API', method: 'GET', path: '/api/wishlist', expectedStatus: 200 },
  { name: 'Orders API', method: 'GET', path: '/api/orders', expectedStatus: 200 },
  { name: 'Returns API', method: 'GET', path: '/api/returns', expectedStatus: 200 },
  { name: 'SEO API', method: 'GET', path: '/api/seo', expectedStatus: 200 },
  { name: 'Newsletter API', method: 'POST', path: '/api/newsletter', headers: {'Content-Type': 'application/json'}, data: JSON.stringify({ email: 'qa+' + Date.now() + '@example.com' }), expectedStatus: 200 },
  // Upload requires multipart/form-data; without file we expect a 400 (bad request) not 200
  { name: 'Upload API', method: 'POST', path: '/api/upload', expectedStatus: 400 },
  { name: 'Addresses API', method: 'GET', path: '/api/addresses', expectedStatus: 200 },
  
  // Admin APIs
  { name: 'Admin Login API', method: 'POST', path: '/api/admin/login', data: JSON.stringify({email: 'admin@shankarmala.com', password: 'Admin@123'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'Admin Dashboard API', method: 'GET', path: '/api/admin/dashboard', expectedStatus: 200 },
  { name: 'Admin Gemstones API', method: 'GET', path: '/api/admin/gemstones', expectedStatus: 200 },
  { name: 'Admin Categories API', method: 'GET', path: '/api/admin/categories', expectedStatus: 200 },
  { name: 'Admin Orders API', method: 'GET', path: '/api/admin/orders', expectedStatus: 200 },
  { name: 'Admin Users API', method: 'GET', path: '/api/admin/users', expectedStatus: 200 },
  { name: 'Admin Banners API', method: 'GET', path: '/api/admin/banners', expectedStatus: 200 },
  { name: 'Admin FAQs API', method: 'GET', path: '/api/admin/faqs', expectedStatus: 200 },
  { name: 'Admin Testimonials API', method: 'GET', path: '/api/admin/testimonials', expectedStatus: 200 },
  { name: 'Admin Press API', method: 'GET', path: '/api/admin/press', expectedStatus: 200 },
  { name: 'Admin Returns API', method: 'GET', path: '/api/admin/returns', expectedStatus: 200 },
  { name: 'Admin SEO API', method: 'GET', path: '/api/admin/seo', expectedStatus: 200 },
  { name: 'Admin Site Settings API', method: 'GET', path: '/api/admin/sitesettings', expectedStatus: 200 },
  { name: 'Admin Theme API', method: 'GET', path: '/api/admin/theme', expectedStatus: 200 },
  { name: 'Admin Navigation API', method: 'GET', path: '/api/admin/navigation', expectedStatus: 200 },
  // Endpoint may not exist (using public/homepage instead); expect 404
  { name: 'Admin Homepage API', method: 'GET', path: '/api/admin/homepage', expectedStatus: 404 },
  { name: 'Admin Inventory API', method: 'GET', path: '/api/admin/inventory', expectedStatus: 200 },
  
  // User APIs
  { name: 'User Login API', method: 'POST', path: '/api/users/login', data: JSON.stringify({email: 'john@shankarmala.com', password: 'password123'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'User Register API', method: 'POST', path: '/api/users/register', data: JSON.stringify({email: `new+${Date.now()}@example.com`, password: 'password123', firstName: 'Test', lastName: 'User'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'User Me API', method: 'GET', path: '/api/users/me', expectedStatus: 200 },
  { name: 'User Wishlist API', method: 'GET', path: '/api/users/wishlist', expectedStatus: 200 },
  { name: 'User Wishlist Count API', method: 'GET', path: '/api/users/wishlist/count', expectedStatus: 200 },
  { name: 'User Recently Viewed API', method: 'GET', path: '/api/users/recently-viewed', expectedStatus: 200 },
  { name: 'User Notifications API', method: 'GET', path: '/api/users/notifications', expectedStatus: 200 },
  { name: 'User Change Password API', method: 'POST', path: '/api/users/change-password', data: JSON.stringify({currentPassword: 'old', newPassword: 'new'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'User Request Password Reset API', method: 'POST', path: '/api/users/request-password-reset', data: JSON.stringify({email: 'test@example.com'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  // Without a valid token, reset-password should return 400
  { name: 'User Reset Password API', method: 'POST', path: '/api/users/reset-password', data: JSON.stringify({token: 'invalid', password: 'newStrongPass1!'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 400 },
  { name: 'User Verify Email API', method: 'POST', path: '/api/users/verify-email', data: JSON.stringify({token: 'test'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'User Signup API', method: 'POST', path: '/api/users/signup', data: JSON.stringify({email: 'signup@example.com', password: 'password', firstName: 'Signup', lastName: 'User'}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  
  // Cart APIs
  { name: 'Cart Add API', method: 'POST', path: '/api/cart/add', data: JSON.stringify({productId: 1, quantity: 1}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'Cart Remove API', method: 'POST', path: '/api/cart/remove', data: JSON.stringify({productId: 1}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'Cart Update API', method: 'POST', path: '/api/cart/update', data: JSON.stringify({productId: 1, quantity: 2}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  { name: 'Cart Clear API', method: 'POST', path: '/api/cart/clear', expectedStatus: 200 },
  { name: 'Cart Count API', method: 'GET', path: '/api/cart/count', expectedStatus: 200 },
  { name: 'Cart Items API', method: 'GET', path: '/api/cart/items', expectedStatus: 200 },
  
  // Checkout APIs
  { name: 'Checkout Session API', method: 'POST', path: '/api/checkout/session', data: JSON.stringify({items: [{id: 1, quantity: 1}]}), headers: {'Content-Type': 'application/json'}, expectedStatus: 200 },
  // Without signature header, webhook correctly responds 400
  { name: 'Checkout Webhook API', method: 'POST', path: '/api/checkout/webhook', expectedStatus: 400 },
  
  // Public Pages
  { name: 'Homepage', method: 'GET', path: '/', expectedStatus: 200 },
  { name: 'Shop Page', method: 'GET', path: '/shop', expectedStatus: 200 },
  { name: 'Categories Page', method: 'GET', path: '/categories', expectedStatus: 200 },
  { name: 'Collections Page', method: 'GET', path: '/collections', expectedStatus: 200 },
  { name: 'About Page', method: 'GET', path: '/about', expectedStatus: 200 },
  { name: 'Contact Page', method: 'GET', path: '/contact', expectedStatus: 200 },
  { name: 'Privacy Page', method: 'GET', path: '/privacy', expectedStatus: 200 },
  { name: 'Terms Page', method: 'GET', path: '/terms', expectedStatus: 200 },
  { name: 'Returns Page', method: 'GET', path: '/returns', expectedStatus: 200 },
  { name: 'Shipping Page', method: 'GET', path: '/shipping', expectedStatus: 200 },
  { name: 'Compare Page', method: 'GET', path: '/compare', expectedStatus: 200 },
  { name: 'Cart Page', method: 'GET', path: '/cart', expectedStatus: 200 },
  { name: 'Wishlist Page', method: 'GET', path: '/wishlist', expectedStatus: 200 },
  { name: 'Login Page', method: 'GET', path: '/login', expectedStatus: 200 },
  { name: 'Signup Page', method: 'GET', path: '/signup', expectedStatus: 200 },
  { name: 'Account Page', method: 'GET', path: '/account', expectedStatus: 200 },
  { name: 'Orders Page', method: 'GET', path: '/orders', expectedStatus: 200 },
  { name: 'Reset Password Page', method: 'GET', path: '/reset-password', expectedStatus: 200 },
  { name: 'Verify Email Page', method: 'GET', path: '/verify-email', expectedStatus: 200 },
  
  // Admin Pages
  { name: 'Admin Login Page', method: 'GET', path: '/admin/login', expectedStatus: 200 },
  { name: 'Admin Dashboard Page', method: 'GET', path: '/admin', expectedStatus: 200 },
  { name: 'Admin Gemstones Page', method: 'GET', path: '/admin/gemstones', expectedStatus: 200 },
  { name: 'Admin Categories Page', method: 'GET', path: '/admin/categories', expectedStatus: 200 },
  { name: 'Admin Orders Page', method: 'GET', path: '/admin/orders', expectedStatus: 200 },
  { name: 'Admin Users Page', method: 'GET', path: '/admin/users', expectedStatus: 200 },
  { name: 'Admin Banners Page', method: 'GET', path: '/admin/banners', expectedStatus: 200 },
  { name: 'Admin FAQs Page', method: 'GET', path: '/admin/faqs', expectedStatus: 200 },
  { name: 'Admin Testimonials Page', method: 'GET', path: '/admin/testimonials', expectedStatus: 200 },
  { name: 'Admin Press Page', method: 'GET', path: '/admin/press', expectedStatus: 200 },
  { name: 'Admin Returns Page', method: 'GET', path: '/admin/returns', expectedStatus: 200 },
  { name: 'Admin SEO Page', method: 'GET', path: '/admin/seo', expectedStatus: 200 },
  { name: 'Admin Site Settings Page', method: 'GET', path: '/admin/sitesettings', expectedStatus: 200 },
  { name: 'Admin Theme Page', method: 'GET', path: '/admin/theme', expectedStatus: 200 },
  { name: 'Admin Navigation Page', method: 'GET', path: '/admin/navigation', expectedStatus: 200 },
  { name: 'Admin Homepage Page', method: 'GET', path: '/admin/homepage', expectedStatus: 200 },
  { name: 'Admin Inventory Page', method: 'GET', path: '/admin/inventory', expectedStatus: 200 },
  { name: 'Admin Analytics Page', method: 'GET', path: '/admin/analytics', expectedStatus: 200 },
  
  // Dynamic Pages
  { name: 'Product Detail Page', method: 'GET', path: '/product/1', expectedStatus: 200 },
  { name: 'Category Detail Page', method: 'GET', path: '/categories/1', expectedStatus: 200 },
  { name: 'Order Detail Page', method: 'GET', path: '/orders/1', expectedStatus: 200 },
  { name: 'Admin User Detail Page', method: 'GET', path: '/admin/users/1', expectedStatus: 200 },
  
  // Error Pages
  { name: '404 Page', method: 'GET', path: '/404', expectedStatus: 404 },
  { name: '500 Page', method: 'GET', path: '/500', expectedStatus: 500 },
];

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(test.path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: test.method,
      headers: test.headers || {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          test: test,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject({
        error: error,
        test: test
      });
    });

    if (test.data) {
      req.write(test.data);
    }
    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('🔍 Running COMPREHENSIVE project analysis...\n');
  
  let passed = 0;
  let failed = 0;
  let errors = [];
  let warnings = [];

  // Simple cookie jar
  let adminCookie = '';
  let userCookie = '';

  for (const test of tests) {
    try {
      // Attach cookies for authenticated routes
      if (test.path.startsWith('/api/admin')) {
        test.headers = test.headers || {};
        if (adminCookie) test.headers['Cookie'] = adminCookie;
      }
      if (test.path.startsWith('/api/users') || test.path.startsWith('/api/cart') || test.path.startsWith('/api/wishlist') || test.path === '/api/orders' || test.path === '/api/addresses') {
        test.headers = test.headers || {};
        if (userCookie) test.headers['Cookie'] = userCookie;
      }

      console.log(`Testing: ${test.name}...`);
      const result = await makeRequest(test);

      // Capture cookies from login responses
      if (test.name === 'Admin Login API' && result.headers['set-cookie']) {
        adminCookie = result.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }
      if (test.name === 'User Login API' && result.headers['set-cookie']) {
        userCookie = result.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }
      
      if (result.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASSED (${result.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (Expected ${test.expectedStatus}, got ${result.status})`);
        failed++;
        errors.push({
          test: test.name,
          expected: test.expectedStatus,
          actual: result.status,
          path: test.path
        });
      }
    } catch (error) {
      const msg = (error && error.error && error.error.message) || (error && error.message) || 'Unknown error';
      console.log(`❌ ${test.name}: ERROR - ${msg}`);
      failed++;
      errors.push({
        test: test.name,
        error: msg,
        path: test.path
      });
    }
  }

  console.log('\n📊 COMPREHENSIVE TEST RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (errors.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error || `Status ${error.actual} instead of ${error.expected}`} (${error.path})`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }

  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: passed + failed,
      passed,
      failed,
      successRate: ((passed / (passed + failed)) * 100).toFixed(1)
    },
    errors,
    warnings
  };

  fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: comprehensive-test-report.json');

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The application is fully functional.');
  } else {
    console.log(`\n⚠️ ${failed} issues found. Please review and fix before deployment.`);
  }
}

runComprehensiveTests().catch(console.error);
