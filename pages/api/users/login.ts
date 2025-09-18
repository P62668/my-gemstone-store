import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, generateRefreshToken, authenticateUser } from '../../../utils/auth';
import { rateLimit } from '../../../utils/rateLimit';
import { logger } from '../../../utils/logger';
import { maskIdentifier, getRequestIp } from '../../../utils/logHelpers';
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

async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<LoginResponse>>
) {
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
    });
    return;
  }

  // Lightweight trace log for debugging
  logger.info('[auth] Login handler invoked');

  try {
    // Rate limit login attempts per IP (async, supports Redis when configured)
    const bodyEmail = (req.body && (req.body as any).email) ? String((req.body as any).email).toLowerCase() : undefined;
    const rl = await rateLimit({ max: 10, windowMs: 60_000, key: 'login', identifier: bodyEmail, lock: { lockMs: 10 * 60 * 1000 } })(req, res);
    if (!rl.success) {
      if (rl.locked && rl.lockUntil) {
        const retryAfter = Math.max(0, Math.ceil((rl.lockUntil - Date.now()) / 1000));
        res.setHeader('Retry-After', String(retryAfter));
      }
      return res.status(429).json({ success: false, error: { message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' } });
    }

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
    logger.info('[auth] Attempting login for', { email: maskIdentifier(email.toLowerCase()) });

    // Authenticate user
    const user = await authenticateUser(email, password);

    if (!user) {
      logger.warn('[auth] Authentication failed for', { email: maskIdentifier(email) });
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } });
    }

    logger.info('[auth] authenticateUser returned for user', { email: maskIdentifier(user.email), id: user.id });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // Set secure cookies using the new utility
    setSecureCookie(res, 'token', token, {
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    setSecureCookie(res, 'refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // Log successful login with masked identifier and IP
    try {
      logger.info('User logged in', { identifier: maskIdentifier(user.email), id: user.id, ip: getRequestIp(req) });
    } catch (e) {
      logger.info('User logged in (fallback)', { id: user.id });
    }

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
  } catch (error: any) {
    logger.error('[auth] Login failed', error, { url: req.url, ip: getRequestIp(req) });
    // More specific error handling
    if (error.message === 'Invalid credentials' || error.message === 'Account is deactivated') {
      return res.status(401).json({
        success: false,
        error: { message: error.message, code: 'INVALID_CREDENTIALS' },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
    });
  }
}

export default loginHandler;
