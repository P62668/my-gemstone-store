import type { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../utils/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    // ...existing code...

  } catch (err: any) {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

export default withAdminAuth(handler);