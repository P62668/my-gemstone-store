const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
if (!process.env.ADMIN_PASSWORD) {
  console.warn('⚠️  Using fallback ADMIN_PASSWORD for tests. Set ADMIN_PASSWORD in the environment for CI/production.');
}

// Test configuration
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200
  },
  {
    name: 'Gemstones API',
    method: 'GET',
    path: '/api/gemstones',
    expectedStatus: 200
  },
  {
    name: 'Categories API',
    method: 'GET',
    path: '/api/categories',
    expectedStatus: 200
  },
  {
    name: 'Admin Login',
    method: 'POST',
    path: '/api/admin/login',
    data: JSON.stringify({
      email: 'admin@shankarmala.com',
      password: ADMIN_PASSWORD
    }),
    headers: { 'Content-Type': 'application/json' },
    expectedStatus: 200
  },
  {
    name: 'FAQ API',
    method: 'GET',
    path: '/api/faq',
    expectedStatus: 200
  },
  {
    name: 'Testimonials API',
    method: 'GET',
    path: '/api/testimonials',
    expectedStatus: 200
  },
  {
    name: 'Press API',
    method: 'GET',
    path: '/api/press',
    expectedStatus: 200
  },
  {
    name: 'Homepage',
    method: 'GET',
    path: '/',
    expectedStatus: 200
  },
  {
    name: 'Shop Page',
    method: 'GET',
    path: '/shop',
    expectedStatus: 200
  }
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
          test: test
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

async function runTests() {
  console.log('🧪 Running comprehensive API tests...\n');
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const result = await makeRequest(test);
      
      if (result.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASSED (${result.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (Expected ${test.expectedStatus}, got ${result.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The application is ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues before deployment.');
  }
}

runTests().catch(console.error);
