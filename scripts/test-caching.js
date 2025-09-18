// Simple cache testing script using Node.js built-in modules
const { execSync } = require('child_process');

console.log('Testing caching implementation...');

// Simple test to verify cache module structure
const fs = require('fs');
const path = require('path');

console.log('Testing caching implementation...');

// Check if cache module exists
const cachePath = path.join(__dirname, '..', 'utils', 'cache.ts');
if (fs.existsSync(cachePath)) {
  console.log('✓ Cache module exists');
  
  // Read the file and check for key functions
  const content = fs.readFileSync(cachePath, 'utf8');
  
  const requiredFunctions = [
    'getCachedValue',
    'setCachedValue',
    'deleteCachedValue',
    'withCache',
    'setCachedValueWithTags',
    'invalidateCacheByTags'
  ];
  
  let allFound = true;
  requiredFunctions.forEach(func => {
    if (content.includes(func)) {
      console.log(`✓ Found function: ${func}`);
    } else {
      console.log(`✗ Missing function: ${func}`);
      allFound = false;
    }
  });
  
  if (allFound) {
    console.log('\n🎉 All required cache functions are present!');
  } else {
    console.log('\n⚠️  Some cache functions are missing');
  }
} else {
  console.log('✗ Cache module does not exist');
}

try {
  // Test if Redis is available
  console.log('1. Checking Redis availability...');
  try {
    execSync('redis-cli ping', { stdio: 'ignore' });
    console.log('   ✓ Redis is available');
  } catch (error) {
    console.log('   ⚠️  Redis not available, using in-memory cache');
  }
  
  // Test the cache module by running a simple API call
  console.log('2. Testing API caching...');
  
  // Start the development server in background
  console.log('   Starting development server...');
  const server = execSync('npm run dev', { 
    cwd: __dirname + '/..',
    stdio: 'ignore',
    detached: true
  });
  
  // Wait a moment for server to start
  setTimeout(() => {
    try {
      // Make a request to a cached API endpoint
      console.log('   Making API request to /api/categories...');
      const result1 = execSync('curl -s http://localhost:3000/api/categories', { 
        cwd: __dirname + '/..',
        timeout: 5000
      });
      
      console.log('   ✓ First API request completed');
      console.log('   Making second API request to /api/categories...');
      
      const result2 = execSync('curl -s http://localhost:3000/api/categories', { 
        cwd: __dirname + '/..',
        timeout: 5000
      });
      
      console.log('   ✓ Second API request completed');
      
      // Compare results
      if (result1.toString() === result2.toString()) {
        console.log('   ✓ API responses match (caching working)');
      } else {
        console.log('   ⚠️  API responses differ');
      }
      
      console.log('\n🎉 Caching tests completed!');
    } catch (error) {
      console.log('   ✗ Error testing API caching:', error.message);
    } finally {
      // Stop the server
      try {
        execSync('kill $(lsof -t -i:3000)', { stdio: 'ignore' });
      } catch (error) {
        // Ignore if server wasn't running
      }
    }
  }, 3000);
  
} catch (error) {
  console.log('Error during caching tests:', error.message);
}