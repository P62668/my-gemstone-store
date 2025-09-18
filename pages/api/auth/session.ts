import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getUserFromRequest } from '../../../utils/getUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First try NextAuth session
    const session = await getSession({ req });
    if (session?.user) {
      return res.status(200).json({ 
        user: session.user,
        authenticated: true 
      });
    }

    // Fallback to our custom auth
    const user = await getUserFromRequest(req, res);
    if (user) {
      return res.status(200).json({ 
        user: user,
        authenticated: true 
      });
    }

    // No session found
    return res.status(200).json({ 
      user: null,
      authenticated: false 
    });
  } catch (error) {
    console.error('Session API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}