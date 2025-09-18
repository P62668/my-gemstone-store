import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';
import { getPersonalizedOffers } from '../../utils/personalizedOffers';
import { logger } from '../../utils/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  
  try {
    if (req.method === 'GET') {
      // Get personalized offers based on user profile
      const offers = await getPersonalizedOffers(user?.id);
      res.status(200).json(offers);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Personalized Offers API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);