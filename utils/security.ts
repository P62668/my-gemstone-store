import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';
import { rateLimit } from './rateLimit';
import { sanitizeInput as adminSanitizeInput } from './adminSecurity';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // Max requests per window
    LOGIN_MAX_ATTEMPTS: 5,
    LOGIN_LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  },
  
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  
  // Session security
  SESSION: {
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
    RENEW_ON_REQUEST: true,
  },
  
  // Input validation
  INPUT: {
    MAX_LENGTH: 1000,
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
  },
  
  // CORS configuration
  CORS: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  
  // Security headers
  SECURITY_HEADERS: {
    CSP: process.env.CONTENT_SECURITY_POLICY || "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;",
    HSTS: process.env.STRICT_TRANSPORT_SECURITY || 'max-age=31536000; includeSubDomains; preload',
    PERMISSIONS_POLICY: process.env.PERMISSIONS_POLICY || 'geolocation=(), microphone=(), camera=()'
  }
};

// Enhanced rate limiting middleware
export const enhancedRateLimit = (maxRequests: number = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) => {
  return rateLimit({
    windowMs: SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
    max: maxRequests,
    key: 'enhanced_rate_limit',
  });
};

// Brute force protection for authentication
export const bruteForceProtection = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
  key: 'auth_brute_force',
  lock: {
    lockMs: SECURITY_CONFIG.RATE_LIMIT.LOGIN_LOCKOUT_DURATION,
  },
});

// Input sanitization to prevent XSS and other injection attacks
export const sanitizeInput = (input: string): string => {
  // Avoid circular dependency by not calling adminSanitizeInput
  // Implement our own sanitization
  
  // Remove script tags and other dangerous patterns first
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, SECURITY_CONFIG.INPUT.MAX_LENGTH);
  
  return sanitized.trim();
};

// SQL injection prevention - escape special characters
export const escapeSQL = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\x00')
    .replace(/\x1a/g, '\\x1a')
    .replace(/--/g, '\\-\\-'); // Escape comment sequences
};

// Validate and sanitize database queries
export const sanitizeQuery = (query: string, params: any[]): { query: string, params: any[] } => {
  // In a real implementation, you would use a proper query builder or ORM
  // that prevents SQL injection automatically. For raw queries, we escape parameters.
  
  // This is a simplified example - in practice, use parameterized queries
  const sanitizedParams = params.map(param => {
    if (typeof param === 'string') {
      return escapeSQL(param);
    }
    return param;
  });
  
  return { query, params: sanitizedParams };
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_CONFIG.PASSWORD.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '12345678', 'qwerty', 'admin'];
  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and weak');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// XSS protection
export const sanitizeHTML = (html: string): string => {
  // Use a proper HTML sanitizer library in production
  // For now, we'll implement basic sanitization
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// CSRF protection
export const generateCSRFToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Validate CSRF token
export const validateCSRFToken = (token: string, expected: string): boolean => {
  // Use timing-safe comparison to prevent timing attacks
  if (!token || !expected || token.length !== expected.length) return false;
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
};

// Security headers middleware
export const securityHeaders = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  // Prevent XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', SECURITY_CONFIG.SECURITY_HEADERS.CSP);
  
  // HTTP Strict Transport Security
  res.setHeader('Strict-Transport-Security', SECURITY_CONFIG.SECURITY_HEADERS.HSTS);
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', SECURITY_CONFIG.SECURITY_HEADERS.PERMISSIONS_POLICY);
  
  // Remove server information
  res.setHeader('X-Powered-By', 'Gemstone Store');
  
  next();
};

// Input validation for API endpoints
export const validateAPIInput = (data: any, requiredFields: string[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
    
    // Additional validation for specific fields
    if (field === 'email' && data[field]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data[field])) {
        errors.push('Invalid email format');
      }
    }
    
    if (field === 'phone' && data[field]) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(data[field])) {
        errors.push('Invalid phone number format');
      }
    }
    
    // Sanitize input
    if (typeof data[field] === 'string') {
      data[field] = sanitizeInput(data[field]);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Session management
export const createSecureSession = (res: NextApiResponse, userId: number): string => {
  const sessionId = require('crypto').randomBytes(32).toString('hex');
  
  // Set secure cookie
  res.setHeader('Set-Cookie', [
    `session_id=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SECURITY_CONFIG.SESSION.MAX_AGE / 1000}`,
    `user_id=${userId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SECURITY_CONFIG.SESSION.MAX_AGE / 1000}`
  ]);
  
  return sessionId;
};

// Session validation
export const validateSession = (req: NextApiRequest): boolean => {
  const sessionId = req.cookies.session_id;
  const userId = req.cookies.user_id;
  
  // In a real implementation, you would check these against a database
  // For now, we'll just check if they exist
  return !!sessionId && !!userId;
};

// Log security events
export const logSecurityEvent = async (event: string, details: any) => {
  // Log to console/file first
  logger.warn(`Security Event: ${event}`, details);
  
  // Log to database
  try {
    await logger.security(event, details);
  } catch (error) {
    logger.error('Failed to log security event to database', error);
  }
};

// Two-factor authentication helpers
export const generate2FASecret = (): string => {
  return require('crypto').randomBytes(20).toString('hex');
};

export const generate2FAToken = (secret: string): string => {
  // In a real implementation, you would use a proper TOTP library
  // For now, we'll generate a simple token
  const timestamp = Math.floor(Date.now() / 30000); // 30-second intervals
  return require('crypto').createHmac('sha256', secret).update(timestamp.toString()).digest('hex').substring(0, 6);
};

// IP address validation
export const getClientIP = (req: NextApiRequest): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

// Block suspicious IP addresses
export const isIPBlocked = (ip: string): boolean => {
  // In a real implementation, you would check against a database of blocked IPs
  // For now, we'll return false
  return false;
};

// Security audit logging
export const logAuditEvent = async (userId: number, action: string, resource: string, details: any = {}) => {
  const auditDetails = {
    userId,
    action,
    resource,
    details,
    timestamp: new Date().toISOString()
  };
  
  logger.info('Audit Event', auditDetails);
  
  // Log to database
  try {
    await logger.security(`Audit: ${action}`, {
      userId,
      resource,
      details
    });
  } catch (error) {
    logger.error('Failed to log audit event to database', error);
  }
};

// Data encryption
export const encryptData = (data: string, secret: string): string => {
  try {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(secret, 'GfG', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    logger.error('Encryption failed', error);
    throw new Error('Encryption failed');
  }
};

// Data decryption
export const decryptData = (encryptedData: string, secret: string): string => {
  try {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.scryptSync(secret, 'GfG', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', error);
    throw new Error('Decryption failed');
  }
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  return require('crypto').randomBytes(length).toString('hex');
};

// Validate secure token
export const validateSecureToken = (token: string, expectedLength: number = 32): boolean => {
  // Check if token is a valid hex string of expected length
  const hexRegex = /^[0-9a-f]+$/;
  return token.length === expectedLength * 2 && hexRegex.test(token);
};

// Validate and sanitize user input for database operations
export const validateAndSanitizeInput = (input: any, type: string): any => {
  switch (type) {
    case 'email':
      if (typeof input !== 'string') return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input) ? input.toLowerCase().trim() : null;
      
    case 'phone':
      if (typeof input !== 'string') return null;
      // Remove all non-digit characters except + at the beginning
      const cleaned = input.replace(/(?!^)\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15 ? cleaned : null;
      
    case 'name':
      if (typeof input !== 'string') return null;
      // Remove potentially dangerous characters
      return input.replace(/[<>{}[\]\\]/g, '').trim().substring(0, 100);
      
    case 'text':
      if (typeof input !== 'string') return null;
      // Basic sanitization
      return input.replace(/[<>{}[\]\\]/g, '').trim().substring(0, 1000);
      
    case 'id':
      // Validate numeric ID
      const id = parseInt(input, 10);
      return !isNaN(id) && id > 0 ? id : null;
      
    case 'slug':
      if (typeof input !== 'string') return null;
      // Allow only alphanumeric characters, hyphens, and underscores
      return input.replace(/[^a-zA-Z0-9\-_]/g, '').toLowerCase().substring(0, 100);
      
    default:
      return input;
  }
};

export default SECURITY_CONFIG;