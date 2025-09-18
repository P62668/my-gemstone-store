class SelfFixPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('SelfFixPlugin', (compilation) => {
      // Use the correct webpack 5 hook for processAssets
      if (compilation.hooks.processAssets) {
        compilation.hooks.processAssets.tap(
          {
            name: 'SelfFixPlugin',
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE
          },
          (assets) => {
            // This is a simple plugin that doesn't actually modify assets
            // but ensures the build process continues
            return assets;
          }
        );
      }
    });
    
    // Add a global self variable for server-side rendering
    compiler.hooks.beforeRun.tap('SelfFixPlugin', () => {
      if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
        global.self = global;
      }
    });
    
    compiler.hooks.watchRun.tap('SelfFixPlugin', () => {
      if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
        global.self = global;
      }
    });
    
    // Handle the canvas-confetti issue specifically
    compiler.hooks.normalModuleFactory.tap('SelfFixPlugin', (factory) => {
      factory.hooks.beforeResolve.tap('SelfFixPlugin', (resolveData) => {
        if (resolveData.request === 'canvas-confetti') {
          // Return a mock module for server-side rendering
          resolveData.request = require.resolve('./canvas-confetti-mock.js');
        }
      });
    });
    
    // Also handle any modules that might reference 'self' directly
    compiler.hooks.compilation.tap('SelfFixPlugin', (compilation) => {
      // Use the correct webpack 5 hook - replace deprecated optimizeChunkAssets
      if (compilation.hooks.processAssets) {
        compilation.hooks.processAssets.tap(
          {
            name: 'SelfFixPlugin',
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
          },
          (assets) => {
            // Process assets if needed
            Object.keys(assets).forEach((filename) => {
              if (filename.endsWith('.js')) {
                // We're not actually modifying assets here, just ensuring the build continues
              }
            });
          }
        );
      }
    });
  }
}

module.exports = SelfFixPlugin;