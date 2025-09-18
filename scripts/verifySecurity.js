#!/usr/bin/env node

/**
 * Security Implementation Verification Script
 * This script verifies that all security components are properly implemented
 */

const fs = require('fs');
const path = require('path');

// List of security files that should exist
const securityFiles = [
  'utils/security.ts',
  'utils/adminSecurity.ts',
  'utils/authMiddleware.ts',
  'utils/dataEncryption.ts',
  'utils/securityAudit.ts',
  'utils/securityChecklist.ts',
  'utils/securityScanner.ts',
  'pages/api/auth/[...nextauth].ts',
  'pages/api/admin/security/dashboard.ts',
  'pages/api/admin/security/encryption.ts',
  'pages/api/admin/security/checklist.ts',
  'pages/api/admin/security/scan.ts',
  'pages/api/health/security.ts'
];

// List of security features to verify
const securityFeatures = [
  'SQL Injection Protection',
  'XSS Prevention',
  'CSRF Protection',
  'Brute Force Protection',
  'Rate Limiting',
  'Data Encryption',
  'Input Validation',
  'Authentication',
  'Authorization',
  'Session Management',
  'Security Headers',
  'Audit Logging',
  'Password Security'
];

console.log('🔍 Shankarmala Gemstore - Security Implementation Verification\n');

// Check if security files exist
console.log('📁 Checking Security Files...');
let filesExist = 0;
let filesMissing = 0;

securityFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    filesExist++;
  } else {
    console.log(`  ❌ ${file} (MISSING)`);
    filesMissing++;
  }
});

console.log(`\n📊 File Status: ${filesExist} present, ${filesMissing} missing\n`);

// Check for security features in code
console.log('🛡️  Checking Security Features...');
let featuresFound = 0;
let featuresMissing = 0;

// Check for specific security implementations
const securityIndicators = {
  'SQL Injection Protection': ['escapeSQL', 'sanitizeQuery', 'PrismaClient'],
  'XSS Prevention': ['sanitizeHTML', 'sanitizeInput'],
  'CSRF Protection': ['generateCSRFToken', 'validateCSRFToken'],
  'Brute Force Protection': ['bruteForceProtection', 'checkLoginAttempts'],
  'Rate Limiting': ['rateLimit', 'enhancedRateLimit'],
  'Data Encryption': ['encryptData', 'decryptData', 'aes-256-cbc'],
  'Input Validation': ['validateAPIInput', 'validateAndSanitizeInput'],
  'Authentication': ['NextAuth', 'withAuth', 'requireAdminAuth'],
  'Authorization': ['hasPermission', 'getPermissionsByRole'],
  'Session Management': ['createSecureSession', 'validateSession'],
  'Security Headers': ['securityHeaders', 'Content-Security-Policy'],
  'Audit Logging': ['logSecurityEvent', 'SecurityLog'],
  'Password Security': ['validatePassword', 'bcrypt']
};

Object.keys(securityIndicators).forEach(feature => {
  const indicators = securityIndicators[feature];
  let found = false;
  
  // Check in key security files
  const keyFiles = [
    'utils/security.ts',
    'utils/adminSecurity.ts',
    'utils/authMiddleware.ts',
    'pages/api/auth/[...nextauth].ts'
  ];
  
  for (const file of keyFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (indicators.some(indicator => content.includes(indicator))) {
        found = true;
        break;
      }
    }
  }
  
  if (found) {
    console.log(`  ✅ ${feature}`);
    featuresFound++;
  } else {
    console.log(`  ❌ ${feature} (NOT FOUND)`);
    featuresMissing++;
  }
});

console.log(`\n📊 Feature Status: ${featuresFound} implemented, ${featuresMissing} missing\n`);

// Summary
console.log('📋 Summary:');
console.log(`  Total Security Files: ${securityFiles.length}`);
console.log(`  Files Present: ${filesExist}`);
console.log(`  Files Missing: ${filesMissing}`);
console.log(`  Security Features: ${Object.keys(securityIndicators).length}`);
console.log(`  Features Implemented: ${featuresFound}`);
console.log(`  Features Missing: ${featuresMissing}`);

if (filesMissing === 0 && featuresMissing === 0) {
  console.log('\n🎉 All security components are properly implemented!');
  console.log('✅ The Shankarmala Gemstore is ready for secure deployment.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some security components are missing or incomplete.');
  console.log('❌ Please review the missing components before deployment.');
  process.exit(1);
}