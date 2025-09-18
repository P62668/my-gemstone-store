const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run Next.js build with bundle analysis
console.log('Building Next.js app with bundle analysis...');

exec('NEXTBundleAnalyzer=true next build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  
  console.log('Build completed successfully!');
  console.log('Bundle analysis report generated.');
  
  // Check if stats.json exists
  const statsPath = path.join(__dirname, '..', '.next', 'analyze', 'stats.json');
  if (fs.existsSync(statsPath)) {
    console.log('Bundle analysis stats file created at:', statsPath);
  } else {
    console.log('Stats file not found. Make sure bundle analysis is enabled.');
  }
});