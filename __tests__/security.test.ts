import { encryptData, decryptData, validatePassword, sanitizeInput, escapeSQL } from '../utils/security';
import { generateCSRFToken, validateCSRFToken } from '../utils/security';
import { validateEmail, validatePassword as validateAdminPassword } from '../utils/adminSecurity';

describe('Security Implementation Tests', () => {
  describe('Data Encryption', () => {
    test('should encrypt and decrypt data correctly', () => {
      const secret = 'test-secret-key-for-encryption';
      const originalData = 'This is sensitive user data';
      
      const encrypted = encryptData(originalData, secret);
      const decrypted = decryptData(encrypted, secret);
      
      expect(decrypted).toBe(originalData);
      expect(encrypted).not.toBe(originalData);
    });

    test('should throw error with invalid decryption key', () => {
      const secret1 = 'test-secret-key-for-encryption';
      const secret2 = 'wrong-secret-key-for-encryption';
      const originalData = 'This is sensitive user data';
      
      const encrypted = encryptData(originalData, secret1);
      
      expect(() => {
        decryptData(encrypted, secret2);
      }).toThrow();
    });
  });

  describe('Password Validation', () => {
    test('should validate strong password', () => {
      const strongPassword = 'MyStr0ng!P@ssw0rd123';
      const result = validatePassword(strongPassword);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak password - too short', () => {
      const weakPassword = 'weak123';
      const result = validatePassword(weakPassword);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    test('should reject weak password - missing uppercase', () => {
      const weakPassword = 'mystr0ng!p@ssw0rd123';
      const result = validatePassword(weakPassword);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    test('should reject weak password - missing lowercase', () => {
      const weakPassword = 'MYSTR0NG!P@SSW0RD123';
      const result = validatePassword(weakPassword);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    test('should reject weak password - missing number', () => {
      const weakPassword = 'MyStrong!Password';
      const result = validatePassword(weakPassword);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    test('should reject weak password - missing special character', () => {
      const weakPassword = 'MyStr0ngPassword123'; // Missing special character
      const result = validatePassword(weakPassword);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    test('should reject common weak passwords', () => {
      const weakPasswords = ['password', '12345678', 'qwerty', 'admin'];
      
      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password is too common and weak');
      });
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize HTML input', () => {
      const dirtyInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(dirtyInput);
      
      // Check that script tags are removed
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('Hello World');
    });

    test('should remove dangerous characters', () => {
      const dirtyInput = 'Hello <World> & "Test"';
      const sanitized = sanitizeInput(dirtyInput);
      
      // Check that dangerous characters are removed
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('{');
      expect(sanitized).not.toContain('}');
      expect(sanitized).not.toContain('[');
      expect(sanitized).not.toContain(']');
      expect(sanitized).not.toContain('\\');
    });

    test('should limit input length', () => {
      const longInput = 'A'.repeat(2000);
      const sanitized = sanitizeInput(longInput);
      
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('SQL Injection Prevention', () => {
    test('should escape SQL special characters', () => {
      const input = "'; DROP TABLE users; --";
      const escaped = escapeSQL(input);
      
      // Check that the string contains escaped versions
      expect(escaped).toContain("\\'"); // Escaped single quote
      expect(escaped).toContain("\\-\\-"); // Escaped comment
    });

    test('should escape quotes properly', () => {
      const input = "O'Reilly";
      const escaped = escapeSQL(input);
      
      expect(escaped).toContain("O\\'Reilly");
    });
  });

  describe('CSRF Protection', () => {
    test('should generate and validate CSRF tokens', () => {
      const token = generateCSRFToken();
      const isValid = validateCSRFToken(token, token);
      
      expect(isValid).toBe(true);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
    });

    test('should reject invalid CSRF tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      const isValid = validateCSRFToken(token1, token2);
      
      expect(isValid).toBe(false);
    });

    test('should reject tokens of different lengths', () => {
      const token1 = generateCSRFToken();
      const token2 = 'short-token';
      const isValid = validateCSRFToken(token1, token2);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.org'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user@@example.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Admin Password Validation', () => {
    test('should validate admin password using same logic', () => {
      const strongPassword = 'MyStr0ng!P@ssw0rd123';
      const result = validateAdminPassword(strongPassword);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});