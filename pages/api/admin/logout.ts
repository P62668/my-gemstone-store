import type { NextApiRequest, NextApiResponse } from 'next';
import { setSecureCookie } from '../../../utils/adminSecurity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the adminToken cookie by setting Max-Age=0
  setSecureCookie(res, 'adminToken', '', { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
