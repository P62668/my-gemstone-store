const fs = require('fs');
const path = require('path');

// Extract critical CSS for above-the-fold content
function extractCriticalCSS() {
  // Read the global CSS file
  const globalCSSPath = path.join(__dirname, '..', 'styles', 'globals.css');
  const luxuryThemeCSSPath = path.join(__dirname, '..', 'styles', 'luxury-theme.css');
  
  let globalCSS = '';
  let luxuryThemeCSS = '';
  
  try {
    globalCSS = fs.readFileSync(globalCSSPath, 'utf8');
    luxuryThemeCSS = fs.readFileSync(luxuryThemeCSSPath, 'utf8');
  } catch (error) {
    console.error('Error reading CSS files:', error);
    return;
  }
  
  // Define critical CSS selectors (above-the-fold content)
  const criticalSelectors = [
    // Base styles
    'html', 'body', '*', 'a',
    
    // Layout
    '.min-h-screen', '.flex', '.flex-col', '.pt-16', '.lg:pt-20', '.flex-1',
    
    // Typography
    '.luxury-font-serif', '.luxury-font-sans',
    
    // Colors and backgrounds
    '.bg-gradient-to-br', '.from-luxury-bg-cream', '.via-luxury-bg-ivory', '.to-luxury-bg-cream',
    '.luxury-bg-gradient', '.text-white', '.text-amber-700', '.text-amber-100',
    
    // Buttons
    '.luxury-button-primary', '.luxury-button-secondary',
    
    // Cards
    '.luxury-card',
    
    // Section headers
    '.luxury-section-header', 'h2', 'p',
    
    // Animations
    '.animate-fadein', '.luxury-fade-in',
    
    // Common utility classes
    '.mx-auto', '.px-4', '.py-16', '.text-center', '.relative', '.overflow-hidden',
    '.max-w-7xl', '.max-w-3xl', '.max-w-2xl'
  ];
  
  // Extract critical CSS (simplified approach)
  let criticalCSS = '';
  
  // Add Tailwind directives
  criticalCSS += '@tailwind base;\n';
  criticalCSS += '@tailwind components;\n';
  criticalCSS += '@tailwind utilities;\n\n';
  
  // Add critical parts of luxury theme by extracting specific sections
  // Extract :root variables
  const rootRegex = /:root\s*\{[^}]*\}/g;
  const rootMatch = luxuryThemeCSS.match(rootRegex);
  if (rootMatch) {
    criticalCSS += rootMatch[0] + '\n\n';
  }
  
  // Extract key luxury components
  const keyComponents = [
    '.luxury-font-serif',
    '.luxury-font-sans',
    '.luxury-button-primary',
    '.luxury-button-secondary',
    '.luxury-card',
    '.luxury-section-header',
    '.luxury-fade-in',
    '.animate-fadein'
  ];
  
  keyComponents.forEach(component => {
    // Create regex to match the component and its variations
    const componentRegex = new RegExp(`${component.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}[^{]*\\{[^}]*\\}(\\s*[^{]*\\{[^}]*\\})*`, 'g');
    const componentMatches = luxuryThemeCSS.match(componentRegex);
    if (componentMatches) {
      criticalCSS += componentMatches.join('\n\n') + '\n\n';
    }
  });
  
  // Write critical CSS to file
  const criticalCSSPath = path.join(__dirname, '..', 'styles', 'critical.css');
  fs.writeFileSync(criticalCSSPath, criticalCSS);
  
  console.log('Critical CSS extracted successfully to:', criticalCSSPath);
}

extractCriticalCSS();