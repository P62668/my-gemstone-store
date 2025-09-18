// Error Utilities Tests
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the logger module before importing errorUtils
vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn()
  }
}));

// Now import the functions after mocking
import { 
  getErrorMessage, 
  isError, 
  safeString, 
  safeNumber, 
  safeBoolean, 
  safeParseJSON, 
  safeArray,
  categorizeError,
  getUserFriendlyMessage,
  reportError
} from '../utils/errorUtils';

describe('Error Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error instance', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return string error as-is', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error message' };
      expect(getErrorMessage(error)).toBe('Object error message');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
    });
  });

  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('Test'))).toBe(true);
      expect(isError(new TypeError('Test'))).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('string')).toBe(false);
      expect(isError(123)).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError({})).toBe(false);
    });
  });

  describe('safeString', () => {
    it('should return string as-is', () => {
      expect(safeString('test')).toBe('test');
    });

    it('should convert number to string', () => {
      expect(safeString(123)).toBe('123');
    });

    it('should return default for null/undefined', () => {
      expect(safeString(null)).toBe('');
      expect(safeString(undefined)).toBe('');
      expect(safeString(null, 'default')).toBe('default');
    });

    it('should convert object to string', () => {
      expect(safeString({})).toBe('[object Object]');
    });
  });

  describe('safeNumber', () => {
    it('should return number as-is', () => {
      expect(safeNumber(123)).toBe(123);
    });

    it('should parse valid string numbers', () => {
      expect(safeNumber('123')).toBe(123);
      expect(safeNumber('123.45')).toBe(123.45);
    });

    it('should return default for invalid strings', () => {
      expect(safeNumber('invalid')).toBe(0);
      expect(safeNumber('invalid', 42)).toBe(42);
    });

    it('should return default for null/undefined', () => {
      expect(safeNumber(null)).toBe(0);
      expect(safeNumber(undefined)).toBe(0);
      expect(safeNumber(null, 42)).toBe(42);
    });
  });

  describe('safeBoolean', () => {
    it('should return boolean as-is', () => {
      expect(safeBoolean(true)).toBe(true);
      expect(safeBoolean(false)).toBe(false);
    });

    it('should parse string booleans', () => {
      expect(safeBoolean('true')).toBe(true);
      expect(safeBoolean('false')).toBe(false);
      expect(safeBoolean('TRUE')).toBe(true);
      expect(safeBoolean('FALSE')).toBe(false);
    });

    it('should convert numbers to boolean', () => {
      expect(safeBoolean(1)).toBe(true);
      expect(safeBoolean(0)).toBe(false);
      expect(safeBoolean(-1)).toBe(true);
    });

    it('should convert other values to boolean', () => {
      expect(safeBoolean('string')).toBe(true);
      expect(safeBoolean({})).toBe(true);
      expect(safeBoolean([])).toBe(true);
    });
  });

  describe('safeParseJSON', () => {
    it('should parse valid JSON', () => {
      const result = safeParseJSON('{"test": "value"}', { default: true });
      expect(result).toEqual({ test: 'value' });
    });

    it('should return default for invalid JSON', () => {
      const result = safeParseJSON('invalid json', { default: true });
      expect(result).toEqual({ default: true });
    });
  });

  describe('safeArray', () => {
    it('should return array as-is', () => {
      const arr = [1, 2, 3];
      expect(safeArray(arr)).toBe(arr);
    });

    it('should return default for non-array values', () => {
      expect(safeArray('not array')).toEqual([]);
      expect(safeArray('not array', [1, 2, 3])).toEqual([1, 2, 3]);
      expect(safeArray(null)).toEqual([]);
      expect(safeArray(undefined)).toEqual([]);
    });
  });

  describe('categorizeError', () => {
    it('should categorize ValidationError', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      expect(categorizeError(error)).toBe('VALIDATION');
    });

    it('should categorize validation messages', () => {
      const error = new Error('Invalid input validation');
      expect(categorizeError(error)).toBe('VALIDATION');
    });

    it('should categorize AuthenticationError', () => {
      const error = new Error('Not authorized');
      error.name = 'AuthenticationError';
      expect(categorizeError(error)).toBe('AUTHENTICATION');
    });

    it('should categorize unauthorized messages', () => {
      const error = new Error('User unauthorized');
      expect(categorizeError(error)).toBe('AUTHENTICATION');
    });

    it('should categorize AuthorizationError', () => {
      const error = new Error('Forbidden access');
      error.name = 'AuthorizationError';
      expect(categorizeError(error)).toBe('AUTHORIZATION');
    });

    it('should categorize forbidden messages', () => {
      const error = new Error('Access forbidden');
      expect(categorizeError(error)).toBe('AUTHORIZATION');
    });

    it('should categorize network errors', () => {
      const error = new Error('Network fetch failed');
      expect(categorizeError(error)).toBe('NETWORK');
    });

    it('should categorize database errors', () => {
      const error = new Error('Database operation failed');
      error.name = 'DatabaseError';
      expect(categorizeError(error)).toBe('DATABASE');
    });

    it('should categorize payment errors', () => {
      const error = new Error('Payment processing failed');
      expect(categorizeError(error)).toBe('PAYMENT');
    });

    it('should categorize unknown errors', () => {
      const error = new Error('Unknown error');
      expect(categorizeError(error)).toBe('UNKNOWN');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return validation message', () => {
      const error = new Error('Validation error');
      error.name = 'ValidationError';
      expect(getUserFriendlyMessage(error)).toBe('Please check your input and try again.');
    });

    it('should return authentication message', () => {
      const error = new Error('Not authorized');
      error.name = 'AuthenticationError';
      expect(getUserFriendlyMessage(error)).toBe('Please log in to continue.');
    });

    it('should return authorization message', () => {
      const error = new Error('Forbidden access');
      error.name = 'AuthorizationError';
      expect(getUserFriendlyMessage(error)).toBe('You do not have permission to perform this action.');
    });

    it('should return network message', () => {
      const error = new Error('Network fetch error');
      expect(getUserFriendlyMessage(error)).toBe('Network error. Please check your connection and try again.');
    });

    it('should return database message', () => {
      const error = new Error('Database error');
      error.name = 'DatabaseError';
      expect(getUserFriendlyMessage(error)).toBe('A database error occurred. Please try again later.');
    });

    it('should return payment message', () => {
      const error = new Error('Payment failed');
      expect(getUserFriendlyMessage(error)).toBe('Payment failed. Please check your payment details and try again.');
    });

    it('should return default message for unknown errors', () => {
      const error = new Error('Unknown error');
      expect(getUserFriendlyMessage(error)).toBe('Something went wrong. Please try again.');
    });
  });

  describe('reportError', () => {
    it('should log error with context', async () => {
      const error = new Error('Test error');
      
      reportError(error, 'test operation');
      
      // Get the mocked logger using dynamic import
      const { logger } = await import('../utils/logger');
      expect(logger.error).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
        message: 'Test error',
        category: 'UNKNOWN',
        context: 'test operation'
      }));
    });
  });
});