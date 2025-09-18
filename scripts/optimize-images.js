const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Convert images to WebP format for better optimization
async function optimizeImages() {
  console.log('Optimizing images to WebP format...');
  
  const imageDir = path.join(__dirname, '..', 'public', 'images');
  if (!fs.existsSync(imageDir)) {
    console.log('Image directory does not exist');
    return;
  }
  
  // Convert images to WebP
  async function convertToWebP(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await convertToWebP(filePath);
      } else if (stat.isFile()) {
        // Check if it's an image file
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.tiff', '.tif'].includes(ext)) {
          const webpPath = filePath.replace(/\.[^/.]+$/, '.webp');
          
          // Only convert if WebP version doesn't exist or is older
          if (!fs.existsSync(webpPath) || fs.statSync(webpPath).mtimeMs < stat.mtimeMs) {
            try {
              console.log(`Converting ${file} to WebP...`);
              await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
              console.log(`  ✓ Converted to ${path.basename(webpPath)}`);
            } catch (error) {
              console.log(`  ✗ Failed to convert ${file}: ${error.message}`);
            }
          }
        }
      }
    }
  }
  
  await convertToWebP(imageDir);
  console.log('Image optimization completed!');
}

// Optimize existing images
async function optimizeExistingImages() {
  console.log('Optimizing existing images...');
  
  const imageDir = path.join(__dirname, '..', 'public', 'images');
  if (!fs.existsSync(imageDir)) {
    console.log('Image directory does not exist');
    return;
  }
  
  // Optimize images
  async function optimizeDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await optimizeDir(filePath);
      } else if (stat.isFile()) {
        // Check if it's an image file
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
          try {
            // Resize and compress images larger than 100KB
            if (stat.size > 100 * 1024) {
              console.log(`Optimizing ${file}...`);
              const tempPath = filePath + '.temp';
              
              // Resize to max 1920px width and compress
              await sharp(filePath)
                .resize({ width: 1920, withoutEnlargement: true })
                .jpeg({ quality: 80, progressive: true })
                .png({ quality: 80, compressionLevel: 9 })
                .toFile(tempPath);
              
              // Replace original file
              fs.renameSync(tempPath, filePath);
              console.log(`  ✓ Optimized ${file}`);
            }
          } catch (error) {
            console.log(`  ✗ Failed to optimize ${file}: ${error.message}`);
          }
        }
      }
    }
  }
  
  await optimizeDir(imageDir);
  console.log('Image optimization completed!');
}

// Run image optimization
async function runImageOptimization() {
  await optimizeExistingImages();
  await optimizeImages();
  
  // Run performance monitor to check results
  console.log('\nChecking optimization results...');
  const { execSync } = require('child_process');
  execSync('node scripts/performance-monitor.js', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  });
}

runImageOptimization().catch(console.error);