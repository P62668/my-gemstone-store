import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { 
  performanceCache, 
  dataCache, 
  longCache, 
  forceInvalidateAllCache,
  deleteCachedValue
} from '../../../../utils/cache';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { keys, forceAll } = req.body;

    // If forceAll is true, invalidate all cache
    if (forceAll) {
      await forceInvalidateAllCache();
      return res.status(200).json({ 
        message: 'Successfully invalidated all cache',
      });
    }

    if (!Array.isArray(keys)) {
      return res.status(400).json({ error: 'Keys must be an array' });
    }

    // Invalidate cache entries for each key
    for (const key of keys) {
      await deleteCachedValue(key);
    }

    return res.status(200).json({ 
      message: `Successfully invalidated cache for keys: ${keys.join(', ')}`,
      invalidatedKeys: keys
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return res.status(500).json({ error: 'Failed to invalidate cache' });
  }
}

export default withAdminAuth(handler);