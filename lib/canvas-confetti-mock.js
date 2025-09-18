// Comprehensive mock for canvas-confetti to prevent "self is not defined" error during server-side rendering

// Ensure all global objects are defined
if (typeof global !== 'undefined') {
  // Handle the case where 'self' is not defined in Node.js environment
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  
  // Also handle the case where 'window' is not defined
  if (typeof global.window === 'undefined') {
    global.window = global;
  }
  
  // And handle the case where 'document' is not defined
  if (typeof global.document === 'undefined') {
    global.document = {};
  }
  
  // Ensure self is always defined
  global.self = global.self || global;
  
  // Ensure window is always defined
  global.window = global.window || global;
  
  // Ensure document is always defined
  global.document = global.document || {};
}

// Also define for non-global environments
if (typeof self === 'undefined') {
  var self = typeof global !== 'undefined' ? global : {};
}

if (typeof window === 'undefined') {
  var window = typeof global !== 'undefined' ? global : {};
}

if (typeof document === 'undefined') {
  var document = {};
}

// Create a comprehensive mock function
const confetti = function() {
  // Always return a resolved promise in server-side context
  return Promise.resolve();
};

// Add all possible methods that canvas-confetti might have
confetti.create = function() {
  return function() {
    return Promise.resolve();
  };
};

confetti.reset = function() {
  return Promise.resolve();
};

confetti.namespace = 'canvas-confetti';

// Add any other potential methods
confetti.version = '1.9.3-mock';
confetti.shapeFromPath = function() { return {}; };
confetti.shapeFromText = function() { return {}; };

// Make it work as a global
if (typeof window !== 'undefined') {
  window.confetti = confetti;
}

if (typeof global !== 'undefined') {
  global.confetti = confetti;
}

// Export as default and named exports
module.exports = confetti;
module.exports.default = confetti;

// Handle CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = confetti;
  module.exports.default = confetti;
}

// Handle ES6 export
if (typeof exports !== 'undefined') {
  exports.default = confetti;
  exports.confetti = confetti;
}

// Ensure the module can be required without errors
try {
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    global.confetti = confetti;
  }
} catch (e) {
  // Ignore errors in setting global
}

// Return the mock function as the default export
export default confetti;