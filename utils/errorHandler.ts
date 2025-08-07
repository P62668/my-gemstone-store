import { NextApiRequest, NextApiResponse } from 'next';

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  statusCode?: number;
}

export const handleApiError = (
  error: any,
  req: NextApiRequest,
  res: NextApiResponse,
  defaultMessage = 'Internal server error',
): void => {
  console.error(`API Error [${req.method} ${req.url}]:`, error);

  let statusCode = 500;
  let message = defaultMessage;
  let code = 'INTERNAL_ERROR';
  let details = '';

  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
    code = 'DATABASE_ERROR';
    details = error.message;
  } else if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided';
    code = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error.message === 'Not authenticated') {
    statusCode = 401;
    message = 'Authentication required. Please log in again.';
    code = 'AUTH_REQUIRED';
    details = error.message;
  } else if (error.message === 'Forbidden') {
    statusCode = 403;
    message = 'Access denied. Insufficient permissions.';
    code = 'FORBIDDEN';
    details = error.message;
  } else if (error.message === 'Not found') {
    statusCode = 404;
    message = 'Resource not found';
    code = 'NOT_FOUND';
    details = error.message;
  } else if (error.message && error.message !== defaultMessage) {
    message = error.message;
    details = error.stack || '';
  }

  const errorResponse: ApiError = {
    error: message,
    details,
    code,
    statusCode,
  };

  res.status(statusCode).json(errorResponse);
};

export const validateRequiredFields = (
  data: any,
  requiredFields: string[],
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter((field) => !data[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
