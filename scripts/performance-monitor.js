const fs = require('fs');
const path = require('path');

// Performance monitoring script to track bundle sizes and performance metrics
class PerformanceMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      css: {},
      js: {},
      images: {},
      overall: {}
    };
  }

  // Measure CSS file sizes
  measureCSS() {
    const cssDir = path.join(__dirname, '..', 'styles');
    const optimizedDir = path.join(cssDir, 'optimized');
    
    const cssFiles = [
      { name: 'globals.css', path: path.join(cssDir, 'globals.css') },
      { name: 'luxury-theme.css', path: path.join(cssDir, 'luxury-theme.css') },
      { name: 'globals.min.css', path: path.join(optimizedDir, 'globals.min.css') },
      { name: 'luxury-theme.min.css', path: path.join(optimizedDir, 'luxury-theme.min.css') },
      { name: 'critical.min.css', path: path.join(cssDir, 'critical.min.css') }
    ];
    
    cssFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        const stats = fs.statSync(file.path);
        this.results.css[file.name] = {
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size)
        };
      }
    });
    
    console.log('CSS File Sizes:');
    Object.keys(this.results.css).forEach(name => {
      console.log(`  ${name}: ${this.results.css[name].sizeFormatted}`);
    });
  }

  // Format bytes to human readable format
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Measure image optimization
  measureImages() {
    const imageDir = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(imageDir)) return;
    
    const imageStats = {
      total: 0,
      optimized: 0,
      webp: 0,
      avif: 0
    };
    
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (stat.isFile()) {
          imageStats.total++;
          
          if (file.endsWith('.webp')) {
            imageStats.webp++;
          } else if (file.endsWith('.avif')) {
            imageStats.avif++;
          }
          
          // Check if optimized (file size < 100KB)
          if (stat.size < 100 * 1024) {
            imageStats.optimized++;
          }
        }
      });
    }
    
    walkDir(imageDir);
    
    this.results.images = imageStats;
    
    console.log('\nImage Optimization Stats:');
    console.log(`  Total images: ${imageStats.total}`);
    console.log(`  Optimized images (<100KB): ${imageStats.optimized}`);
    console.log(`  WebP format: ${imageStats.webp}`);
    console.log(`  AVIF format: ${imageStats.avif}`);
  }

  // Generate performance report
  generateReport() {
    this.measureCSS();
    this.measureImages();
    
    // Calculate overall stats
    const totalCSS = Object.values(this.results.css).reduce((sum, file) => sum + file.size, 0);
    this.results.overall.cssTotal = {
      size: totalCSS,
      sizeFormatted: this.formatBytes(totalCSS)
    };
    
    // Save report
    const reportPath = path.join(__dirname, '..', 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\nPerformance Report Generated:');
    console.log(`  Report saved to: ${reportPath}`);
    console.log(`  Total CSS size: ${this.results.overall.cssTotal.sizeFormatted}`);
    
    return this.results;
  }
}

// Run performance monitoring
function runPerformanceMonitor() {
  const monitor = new PerformanceMonitor();
  const results = monitor.generateReport();
  
  // Log summary
  console.log('\n=== PERFORMANCE SUMMARY ===');
  console.log(`CSS Files Total Size: ${results.overall.cssTotal.sizeFormatted}`);
  console.log(`Images Total: ${results.images.total}`);
  console.log(`Optimized Images: ${results.images.optimized}`);
  
  // Check if we're meeting performance goals
  const cssSizeKB = results.overall.cssTotal.size / 1024;
  if (cssSizeKB < 50) {
    console.log('✅ CSS optimization goal met (<50KB total)');
  } else {
    console.log(`⚠️  CSS optimization goal not met (${cssSizeKB.toFixed(2)}KB total, goal: <50KB)`);
  }
  
  const optimizedImageRatio = results.images.total > 0 ? results.images.optimized / results.images.total : 0;
  if (optimizedImageRatio >= 0.8) {
    console.log('✅ Image optimization goal met (≥80% optimized)');
  } else {
    console.log(`⚠️  Image optimization goal not met (${(optimizedImageRatio * 100).toFixed(1)}% optimized, goal: ≥80%)`);
  }
}

runPerformanceMonitor();