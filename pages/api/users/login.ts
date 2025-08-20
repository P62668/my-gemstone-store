import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, generateRefreshToken, authenticateUser } from '../../../utils/auth';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../utils/logger';
import { validateEmail } from '../../../utils/validation';
import { setSecureCookie } from '../../../utils/cookieParser';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

const loginSchema = {
  email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, type: 'string', minLength: 8 },
};

async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<LoginResponse>>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    });
    return;
  }

  try {
    // Lightweight trace log for debugging
    console.info('[auth] Login handler invoked');

    // Validate request body
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: { message: 'Email and password are required', code: 'MISSING_CREDENTIALS' },
      });
      return;
    }

    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid email format', code: 'INVALID_EMAIL' },
      });
      return;
    }

    // Trace the email attempting login (avoid logging password)
    console.info('[auth] Attempting login for:', email.toLowerCase());

    // Authenticate user
    const user = await authenticateUser(email, password);

    console.info('[auth] authenticateUser returned for:', user.email, 'id:', user.id);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Set secure cookies using the new utility
    setSecureCookie(res, 'token', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    setSecureCookie(res, 'refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Log successful login
    logger.info(`User logged in: ${user.email}`, req);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error('Login failed', req, error as Error);
    console.error('[auth] Login failed error:', (error as Error).message);
    
    res.status(401).json({
      success: false,
      error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
    });
  }
}

export default loginHandler;
