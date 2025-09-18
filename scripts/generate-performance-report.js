const fs = require('fs');
const path = require('path');

/**
 * Generate a comprehensive performance report
 * This script analyzes bundle sizes, load times, and other performance metrics
 */

class PerformanceReportGenerator {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      summary: {},
      bundleAnalysis: {},
      performanceMetrics: {},
      recommendations: []
    };
  }

  // Analyze bundle sizes
  analyzeBundles() {
    const bundleDir = path.join(__dirname, '..', '.next', 'static', 'chunks');
    const bundleSizes = {};
    
    if (fs.existsSync(bundleDir)) {
      const files = fs.readdirSync(bundleDir);
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(bundleDir, file);
          const stats = fs.statSync(filePath);
          bundleSizes[file] = {
            size: stats.size,
            sizeFormatted: this.formatBytes(stats.size)
          };
        }
      });
    }
    
    // Sort by size (largest first)
    const sortedBundles = Object.entries(bundleSizes)
      .sort(([,a], [,b]) => b.size - a.size)
      .reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
    
    this.report.bundleAnalysis = {
      bundles: sortedBundles,
      totalSize: Object.values(bundleSizes).reduce((sum, bundle) => sum + bundle.size, 0),
      totalSizeFormatted: this.formatBytes(Object.values(bundleSizes).reduce((sum, bundle) => sum + bundle.size, 0))
    };
    
    console.log('Bundle Analysis:');
    console.log(`Total Bundle Size: ${this.report.bundleAnalysis.totalSizeFormatted}`);
    console.log('Top 5 Largest Bundles:');
    Object.entries(sortedBundles)
      .slice(0, 5)
      .forEach(([name, bundle]) => {
        console.log(`  ${name}: ${bundle.sizeFormatted}`);
      });
  }

  // Analyze CSS files
  analyzeCSS() {
    const cssDir = path.join(__dirname, '..', 'styles');
    const optimizedDir = path.join(cssDir, 'optimized');
    
    const cssFiles = [
      { name: 'globals.css', path: path.join(cssDir, 'globals.css') },
      { name: 'luxury-theme.css', path: path.join(cssDir, 'luxury-theme.css') },
      { name: 'globals.min.css', path: path.join(optimizedDir, 'globals.min.css') },
      { name: 'luxury-theme.min.css', path: path.join(optimizedDir, 'luxury-theme.min.css') },
      { name: 'critical.min.css', path: path.join(cssDir, 'critical.min.css') }
    ];
    
    const cssSizes = {};
    
    cssFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        const stats = fs.statSync(file.path);
        cssSizes[file.name] = {
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size)
        };
      }
    });
    
    this.report.cssAnalysis = {
      files: cssSizes,
      totalSize: Object.values(cssSizes).reduce((sum, file) => sum + file.size, 0),
      totalSizeFormatted: this.formatBytes(Object.values(cssSizes).reduce((sum, file) => sum + file.size, 0))
    };
    
    console.log('\nCSS Analysis:');
    console.log(`Total CSS Size: ${this.report.cssAnalysis.totalSizeFormatted}`);
    Object.entries(cssSizes).forEach(([name, file]) => {
      console.log(`  ${name}: ${file.sizeFormatted}`);
    });
  }

  // Analyze images
  analyzeImages() {
    const imageDir = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(imageDir)) return;
    
    const imageStats = {
      total: 0,
      totalSize: 0,
      optimized: 0,
      webp: 0,
      avif: 0,
      largeImages: [] // Images > 100KB
    };
    
    // Bind this context for the nested function
    const formatBytes = this.formatBytes.bind(this);
    
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (stat.isFile() && (file.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i))) {
          imageStats.total++;
          imageStats.totalSize += stat.size;
          
          if (file.endsWith('.webp')) {
            imageStats.webp++;
          } else if (file.endsWith('.avif')) {
            imageStats.avif++;
          }
          
          // Check if optimized (file size < 100KB)
          if (stat.size < 100 * 1024) {
            imageStats.optimized++;
          }
          
          // Track large images
          if (stat.size > 100 * 1024) { // 100KB
            imageStats.largeImages.push({
              name: file,
              size: stat.size,
              sizeFormatted: formatBytes(stat.size)
            });
          }
        }
      });
    }
    
    walkDir(imageDir);
    
    this.report.imageAnalysis = {
      ...imageStats,
      totalSizeFormatted: this.formatBytes(imageStats.totalSize),
      optimizationRatio: imageStats.total > 0 ? (imageStats.optimized / imageStats.total) : 0
    };
    
    console.log('\nImage Analysis:');
    console.log(`Total Images: ${imageStats.total}`);
    console.log(`Total Image Size: ${this.report.imageAnalysis.totalSizeFormatted}`);
    console.log(`Optimized Images (<100KB): ${imageStats.optimized}`);
    console.log(`WebP Format: ${imageStats.webp}`);
    console.log(`AVIF Format: ${imageStats.avif}`);
    console.log(`Optimization Ratio: ${(this.report.imageAnalysis.optimizationRatio * 100).toFixed(1)}%`);
    
    if (imageStats.largeImages.length > 0) {
      console.log('\nLarge Images (>100KB):');
      imageStats.largeImages
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach(image => {
          console.log(`  ${image.name}: ${image.sizeFormatted}`);
        });
    }
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    
    // Bundle size recommendations
    if (this.report.bundleAnalysis.totalSize > 500 * 1024) { // 500KB
      recommendations.push({
        priority: 'high',
        category: 'Bundle Size',
        message: 'Total bundle size is large. Consider code splitting and lazy loading.',
        impact: 'High'
      });
    }
    
    // CSS recommendations
    if (this.report.cssAnalysis && this.report.cssAnalysis.totalSize > 100 * 1024) { // 100KB
      recommendations.push({
        priority: 'medium',
        category: 'CSS Optimization',
        message: 'CSS bundle is large. Consider further purging unused styles.',
        impact: 'Medium'
      });
    }
    
    // Image recommendations
    if (this.report.imageAnalysis) {
      if (this.report.imageAnalysis.optimizationRatio < 0.8) {
        recommendations.push({
          priority: 'high',
          category: 'Image Optimization',
          message: 'Less than 80% of images are optimized. Consider compressing large images.',
          impact: 'High'
        });
      }
      
      if (this.report.imageAnalysis.largeImages.length > 5) {
        recommendations.push({
          priority: 'medium',
          category: 'Image Optimization',
          message: `Found ${this.report.imageAnalysis.largeImages.length} large images. Consider resizing or compressing.`,
          impact: 'Medium'
        });
      }
      
      const webpRatio = this.report.imageAnalysis.webp / this.report.imageAnalysis.total;
      if (webpRatio < 0.5) {
        recommendations.push({
          priority: 'low',
          category: 'Image Format',
          message: 'Less than 50% of images use WebP format. Consider converting more images.',
          impact: 'Low'
        });
      }
    }
    
    this.report.recommendations = recommendations;
    
    console.log('\nPerformance Recommendations:');
    recommendations.forEach(rec => {
      const priorityColor = rec.priority === 'high' ? '\x1b[31m' : 
                           rec.priority === 'medium' ? '\x1b[33m' : '\x1b[36m';
      console.log(`${priorityColor}${rec.priority.toUpperCase()}\x1b[0m [${rec.category}] ${rec.message}`);
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

  // Generate summary
  generateSummary() {
    this.report.summary = {
      totalBundleSize: this.report.bundleAnalysis.totalSizeFormatted,
      totalCSSSize: this.report.cssAnalysis?.totalSizeFormatted || '0 Bytes',
      totalImageSize: this.report.imageAnalysis?.totalSizeFormatted || '0 Bytes',
      imageOptimizationRatio: this.report.imageAnalysis?.optimizationRatio || 0,
      recommendationsCount: this.report.recommendations.length
    };
    
    console.log('\n=== PERFORMANCE SUMMARY ===');
    console.log(`Total Bundle Size: ${this.report.summary.totalBundleSize}`);
    console.log(`Total CSS Size: ${this.report.summary.totalCSSSize}`);
    console.log(`Total Image Size: ${this.report.summary.totalImageSize}`);
    console.log(`Image Optimization: ${(this.report.summary.imageOptimizationRatio * 100).toFixed(1)}%`);
    console.log(`Recommendations: ${this.report.summary.recommendationsCount}`);
  }

  // Save report to file
  saveReport() {
    const reportPath = path.join(__dirname, '..', 'performance-report-detailed.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);
  }

  // Run full analysis
  async generateReport() {
    console.log('Generating Performance Report...\n');
    
    try {
      this.analyzeBundles();
      this.analyzeCSS();
      this.analyzeImages();
      this.generateRecommendations();
      this.generateSummary();
      this.saveReport();
      
      console.log('\n✅ Performance report generation completed successfully!');
    } catch (error) {
      console.error('❌ Error generating performance report:', error.message);
      process.exit(1);
    }
  }
}

// Run the report generator
async function runReportGenerator() {
  const generator = new PerformanceReportGenerator();
  await generator.generateReport();
}

// Only run if called directly
if (require.main === module) {
  runReportGenerator();
}

module.exports = PerformanceReportGenerator;