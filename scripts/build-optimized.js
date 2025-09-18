const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to optimize CSS before build
function optimizeCSSBeforeBuild() {
  console.log('Optimizing CSS files before build...');
  
  try {
    // Run CSS optimization script
    execSync('node scripts/optimize-css.js', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    console.log('CSS optimization completed successfully!');
  } catch (error) {
    console.error('Error optimizing CSS before build:', error.message);
    process.exit(1);
  }
}

// Function to update package.json scripts to use optimized CSS
function updateBuildProcess() {
  console.log('Updating build process to use optimized CSS...');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update build script to include CSS optimization
  if (packageJson.scripts && packageJson.scripts.build) {
    // Only add optimization if it's not already there
    if (!packageJson.scripts.build.includes('optimize-css')) {
      const originalBuild = packageJson.scripts.build;
      packageJson.scripts.build = "node scripts/optimize-css.js && " + originalBuild;
    }
  }
  
  // Add a production build script that uses optimized CSS
  packageJson.scripts['build:optimized'] = "node scripts/optimize-css.js && next build";
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Build process updated successfully!');
}

// Run the optimization and update process
function runBuildOptimization() {
  optimizeCSSBeforeBuild();
  updateBuildProcess();
  
  console.log('CSS optimization and build process update completed!');
  console.log('You can now run "npm run build:optimized" to build with optimized CSS.');
}

runBuildOptimization();