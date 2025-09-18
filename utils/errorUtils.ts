import { logger } from '../utils/logger';

// Error handling utilities for production readiness

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const safeString = (value: unknown, defaultValue: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
};

export const safeNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

export const safeBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    // If it's a non-empty string, consider it true (except for 'false')
    if (value.toLowerCase() === 'false') {
      return false;
    }
    return value.length > 0;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  // For objects and arrays, return true (they exist)
  if (value !== null && value !== undefined) {
    return true;
  }
  return false; // null and undefined are false
};

export const safeParseJSON = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
};

export const safeArray = <T>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return fallback;
};

export const categorizeError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === 'ValidationError') {
      return 'VALIDATION';
    }
    if (error.name === 'AuthenticationError') {
      return 'AUTHENTICATION';
    }
    if (error.name === 'AuthorizationError') {
      return 'AUTHORIZATION';
    }
    // Check message content for categorization
    const message = error.message.toLowerCase();
    if (message.includes('validation') || 
        message.includes('invalid')) {
      return 'VALIDATION';
    }
    if (message.includes('unauthorized') || 
        message.includes('not authorized') ||
        message.includes('authentication')) {
      return 'AUTHENTICATION';
    }
    if (message.includes('forbidden') || 
        message.includes('access denied') ||
        message.includes('authorization')) {
      return 'AUTHORIZATION';
    }
    if (message.includes('database') || 
        message.includes('prisma')) {
      return 'DATABASE';
    }
    if (message.includes('network') || 
        message.includes('fetch') ||
        message.includes('connection')) {
      return 'NETWORK';
    }
    if (message.includes('payment') || 
        message.includes('stripe') ||
        message.includes('charge')) {
      return 'PAYMENT';
    }
  }
  return 'UNKNOWN';
};

export const getUserFriendlyMessage = (error: unknown): string => {
  const category = categorizeError(error);
  
  switch (category) {
    case 'VALIDATION':
      return 'Please check your input and try again.';
    case 'AUTHENTICATION':
      return 'Please log in to continue.';
    case 'AUTHORIZATION':
      return 'You do not have permission to perform this action.';
    case 'NETWORK':
      return 'Network error. Please check your connection and try again.';
    case 'DATABASE':
      return 'A database error occurred. Please try again later.';
    case 'PAYMENT':
      return 'Payment failed. Please check your payment details and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export const reportError = (error: unknown, context?: string): void => {
  // In production, you would send this to your error tracking service
  const logData: any = {
    message: getErrorMessage(error),
    category: categorizeError(error),
    timestamp: new Date().toISOString()
  }
  
  if (context) {
    logData.context = context
  }
  
  // Use the logger from the logger module
  logger.error('Application Error:', logData);
};
