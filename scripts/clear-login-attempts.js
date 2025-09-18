// Script to clear admin login attempts
const { loginAttempts } = require('../utils/adminSecurity');

console.log('Current login attempts:', loginAttempts.size);

// Clear all login attempts
loginAttempts.clear();

console.log('Login attempts cleared. Current count:', loginAttempts.size);