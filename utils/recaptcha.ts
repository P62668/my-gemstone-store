import { logger } from './logger';

export async function verifyRecaptcha(token: string | undefined, remoteIp?: string): Promise<{ success: boolean; score?: number; action?: string; errorCodes?: any }> {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) {
    // No secret configured — do not block, but log for visibility
    logger.warn('Recaptcha not configured (RECAPTCHA_SECRET missing); skipping verification');
    return { success: true };
  }

  if (!token) {
    return { success: false };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    if (remoteIp) params.append('remoteip', remoteIp);

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();
    if (!data) return { success: false };
    if (data.success) {
      return { success: true, score: data.score, action: data.action };
    }
    logger.warn('Recaptcha verification failed', { data });
    return { success: false, errorCodes: data['error-codes'] };
  } catch (err) {
    logger.error('Recaptcha verification error', err as Error);
    // Fail-open: do not block on verification errors to avoid availability issues
    return { success: true };
  }
}
