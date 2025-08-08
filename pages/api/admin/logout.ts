import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear the authentication cookie
  const isProd = process.env.NODE_ENV === 'production';
  let cookie = 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict';
  if (isProd) cookie += '; Secure; Priority=High';
  res.setHeader('Set-Cookie', cookie);

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}
