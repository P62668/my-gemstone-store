const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Optimize CSS files using PurgeCSS
function optimizeCSS() {
  console.log('Optimizing CSS files...');
  
  // Create optimized directory if it doesn't exist
  const optimizedDir = path.join(__dirname, '..', 'styles', 'optimized');
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }
  
  try {
    // Run PurgeCSS to remove unused CSS
    execSync('npx purgecss --css styles/globals.css styles/luxury-theme.css --content pages/**/*.{js,jsx,ts,tsx} components/**/*.{js,jsx,ts,tsx} --output styles/optimized/', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    console.log('CSS optimization completed successfully!');
  } catch (error) {
    console.error('Error optimizing CSS:', error.message);
    
    // Fallback: Copy original files to optimized directory
    const filesToCopy = ['globals.css', 'luxury-theme.css'];
    filesToCopy.forEach(file => {
      const sourcePath = path.join(__dirname, '..', 'styles', file);
      const destPath = path.join(optimizedDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to optimized directory`);
      }
    });
    
    console.log('Fallback: Copied original CSS files to optimized directory');
  }
}

// Minify CSS files
function minifyCSS() {
  console.log('Minifying CSS files...');
  
  const optimizedDir = path.join(__dirname, '..', 'styles', 'optimized');
  if (!fs.existsSync(optimizedDir)) {
    console.log('Optimized directory does not exist. Running optimization first...');
    optimizeCSS();
  }
  
  try {
    // Minify CSS files using cssnano
    const filesToMinify = ['globals.css', 'luxury-theme.css'];
    filesToMinify.forEach(file => {
      const filePath = path.join(optimizedDir, file);
      if (fs.existsSync(filePath)) {
        const minifiedPath = filePath.replace('.css', '.min.css');
        execSync(`npx cssnano ${filePath} ${minifiedPath}`, {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit'
        });
        console.log(`Minified ${file}`);
      }
    });
    
    console.log('CSS minification completed successfully!');
  } catch (error) {
    console.error('Error minifying CSS:', error.message);
  }
}

// Run both optimization and minification
function runCSSTools() {
  optimizeCSS();
  minifyCSS();
}

runCSSTools();