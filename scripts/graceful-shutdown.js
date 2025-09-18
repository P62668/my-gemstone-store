/**
 * Graceful Shutdown Handler
 * 
 * This module provides a graceful shutdown mechanism for the application,
 * ensuring that all database connections and pending operations are properly
 * closed before the process exits.
 */

const { prisma } = require('../lib/prisma');

let isShuttingDown = false;

/**
 * Initialize graceful shutdown handlers
 */
function setupGracefulShutdown() {
  // Prevent multiple shutdown attempts
  if (isShuttingDown) return;
  
  const signals = ['SIGINT', 'SIGTERM', 'SIGUSR2']; // SIGUSR2 is used by nodemon
  
  signals.forEach((signal) => {
    process.once(signal, async () => {
      console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
      await performGracefulShutdown(signal);
    });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:', error);
    await performGracefulShutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Promise Rejection:', reason);
    await performGracefulShutdown('unhandledRejection');
  });
  
  console.log('✅ Graceful shutdown handlers initialized');
}

/**
 * Perform the graceful shutdown sequence
 * @param {string} signal - The signal that triggered the shutdown
 */
async function performGracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('🔄 Starting graceful shutdown sequence...');
  
  try {
    // Set a timeout to force exit if graceful shutdown takes too long
    const forceExitTimeout = setTimeout(() => {
      console.error('⏱️ Graceful shutdown timed out after 10s, forcing exit');
      process.exit(1);
    }, 10000);
    
    // Close database connections
    console.log('🔌 Closing database connections...');
    await prisma.$disconnect();
    console.log('✅ Database connections closed successfully');
    
    // Clear the force exit timeout
    clearTimeout(forceExitTimeout);
    
    // Exit with success code for clean signals, error code for crashes
    const exitCode = ['SIGINT', 'SIGTERM', 'SIGUSR2'].includes(signal) ? 0 : 1;
    console.log(`👋 Graceful shutdown complete, exiting with code ${exitCode}`);
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

module.exports = { setupGracefulShutdown };