/**
 * Client-side performance monitoring utilities
 * Tracks page load times, user interactions, and frontend performance
 */

// Performance metrics storage
interface ClientPerformanceMetrics {
  pageLoadTime: number | null;
  domContentLoadedTime: number | null;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
  largestContentfulPaint: number | null;
  firstInputDelay: number | null;
  cumulativeLayoutShift: number | null;
}

// Initialize performance metrics
const performanceMetrics: ClientPerformanceMetrics = {
  pageLoadTime: null,
  domContentLoadedTime: null,
  firstPaint: null,
  firstContentfulPaint: null,
  largestContentfulPaint: null,
  firstInputDelay: null,
  cumulativeLayoutShift: null,
};

/**
 * Initialize client-side performance monitoring
 */
export function initClientPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Page load timing
  if (document.readyState === 'complete') {
    capturePageLoadMetrics();
  } else {
    window.addEventListener('load', capturePageLoadMetrics);
  }
  
  // First paint timing
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    // First Paint and First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          performanceMetrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          performanceMetrics.firstContentfulPaint = entry.startTime;
        }
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });
    
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      performanceMetrics.largestContentfulPaint = lastEntry.startTime;
    });
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // @ts-ignore
        performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
      }
    });
    
    fidObserver.observe({ entryTypes: ['first-input', 'pointerdown', 'keydown'] });
    
    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // @ts-ignore
        if (!entry.hadRecentInput) {
          // @ts-ignore
          clsValue += entry.value;
        }
      }
      performanceMetrics.cumulativeLayoutShift = clsValue;
    });
    
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

/**
 * Capture page load metrics
 */
function capturePageLoadMetrics() {
  if (typeof window === 'undefined' || !('performance' in window)) return;
  
  const perfData = window.performance.timing;
  
  performanceMetrics.pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  performanceMetrics.domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
  
  // Send metrics to server (in a real implementation, this would send to your analytics endpoint)
  sendPerformanceMetricsToServer(performanceMetrics);
}

/**
 * Send performance metrics to server
 */
function sendPerformanceMetricsToServer(metrics: ClientPerformanceMetrics) {
  // In a real implementation, you would send these metrics to your analytics endpoint
  // For now, we'll just log them to the console
  console.log('Client Performance Metrics:', metrics);
  
  // Example of how you might send to a server endpoint:
  /*
  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
    }),
  }).catch((error) => {
    console.error('Failed to send performance metrics:', error);
  });
  */
}

/**
 * Track user interaction performance
 */
export function trackUserInteraction(elementId: string, action: string) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - startTime;
      console.log(`User interaction '${action}' on element '${elementId}' took ${duration.toFixed(2)}ms`);
      
      // In a real implementation, send this to your analytics endpoint
      // sendInteractionMetric(elementId, action, duration);
    }
  };
}

/**
 * Track component render performance
 */
export function trackComponentRender(componentName: string) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - startTime;
      console.log(`Component '${componentName}' render took ${duration.toFixed(2)}ms`);
      
      // In a real implementation, send this to your analytics endpoint
      // sendRenderMetric(componentName, duration);
    }
  };
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): ClientPerformanceMetrics {
  return { ...performanceMetrics };
}

/**
 * Measure bundle sizes
 */
export function measureBundleSizes() {
  if (typeof window === 'undefined' || !('performance' in window)) return;
  
  // Get resource timing entries
  const resources = performance.getEntriesByType('resource');
  
  // Filter for JavaScript files
  const jsFiles = resources.filter(resource => 
    // @ts-ignore
    resource.name.endsWith('.js') || resource.name.includes('/_next/static/')
  );
  
  // Calculate total JS size
  let totalJSSize = 0;
  jsFiles.forEach(resource => {
    // @ts-ignore
    totalJSSize += resource.transferSize || resource.encodedBodySize || 0;
  });
  
  console.log(`Total JavaScript bundle size: ${(totalJSSize / 1024).toFixed(2)} KB`);
  
  return {
    totalJSSize,
    jsFiles: jsFiles.length,
  };
}

// Initialize performance monitoring when module is loaded
if (typeof window !== 'undefined') {
  // Small delay to ensure page is loaded
  setTimeout(() => {
    initClientPerformanceMonitoring();
  }, 1000);
}

export default {
  initClientPerformanceMonitoring,
  trackUserInteraction,
  trackComponentRender,
  getPerformanceMetrics,
  measureBundleSizes,
};