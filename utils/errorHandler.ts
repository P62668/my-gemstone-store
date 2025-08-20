import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export function handleApiError(error: unknown, req: NextApiRequest, res: NextApiResponse): void {
  let apiError: ApiError;

  // Convert to ApiError if it's not already
  if (error instanceof AppError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new AppError(error.message);
  } else {
    apiError = new AppError('An unexpected error occurred');
  }

  // Log error with context
  const logContext = {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    errorCode: apiError.code,
    statusCode: apiError.statusCode,
    message: apiError.message,
    stack: process.env.NODE_ENV === 'development' ? apiError.stack : undefined,
  };

  if (apiError.statusCode && apiError.statusCode >= 500) {
    logger.error('Server error', undefined, logContext);
  } else {
    logger.warn('Client error', logContext);
  }

  // Send error response
  const response: any = {
    error: {
      message: apiError.message,
      code: apiError.code,
    },
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && apiError.stack) {
    response.error.stack = apiError.stack;
  }

  // Set appropriate headers
  res.status(apiError.statusCode || 500);
  
  // Set rate limit headers if applicable
  if (apiError instanceof RateLimitError) {
    res.setHeader('Retry-After', '60');
  }

  res.json(response);
}

export function withErrorHandler(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(error, req, res);
    }
  };
}

export function validateRequiredFields(body: any, fields: string[]): void {
  const missingFields = fields.filter(field => !body[field]);
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validatePaginationParams(query: any): { page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
  
  return { page, limit };
}
