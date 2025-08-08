import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }
  // Remove the token cookie
  const isProd = process.env.NODE_ENV === 'production';
  let cookie = 'token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict';
  if (isProd) cookie += '; Secure; Priority=High';
  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ message: 'Logged out' });
}
