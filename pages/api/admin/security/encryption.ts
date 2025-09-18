import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { logger } from '../../../../utils/logger';
import { logSecurityEvent, getClientIP } from '../../../../utils/security';
import { generateSecureKey, validateKey } from '../../../../utils/dataEncryption';

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientIP = getClientIP(req);
  
  try {
    // Log access to encryption management
    logSecurityEvent('Encryption Management Access', { 
      userId: (req as any).user?.id,
      ip: clientIP,
      method: req.method
    });

    switch (req.method) {
      case 'POST':
        return await handleGenerateKey(req, res);
      case 'GET':
        return await handleGetKeyInfo(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    logger.error('Encryption management error', error);
    logSecurityEvent('Encryption Management Error', { 
      userId: (req as any).user?.id,
      ip: clientIP,
      error: error.message
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Generate a new encryption key
 */
async function handleGenerateKey(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { length = 32 } = req.body;
    
    // Validate length parameter
    if (typeof length !== 'number' || length < 16 || length > 64) {
      return res.status(400).json({ error: 'Invalid key length. Must be between 16 and 64 bytes.' });
    }
    
    // Generate secure key
    const key = generateSecureKey(length);
    
    // Log key generation
    logSecurityEvent('Encryption Key Generated', { 
      userId: (req as any).user?.id,
      ip: getClientIP(req),
      keyLength: length
    });
    
    // Return key information (never return the actual key in a real application)
    return res.status(200).json({
      message: 'Encryption key generated successfully',
      keyLength: length,
      keyHash: require('crypto').createHash('sha256').update(key).digest('hex'),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Key generation failed', error);
    return res.status(500).json({ error: 'Failed to generate encryption key' });
  }
}

/**
 * Get encryption key information
 */
async function handleGetKeyInfo(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real application, you would return information about existing keys
    // but never return the actual keys
    
    return res.status(200).json({
      message: 'Encryption key management information',
      supportedAlgorithms: ['aes-256-cbc'],
      recommendedKeyLength: 32,
      keyRotationPolicy: 'Rotate keys every 90 days',
      lastKeyRotation: '2025-01-01T00:00:00Z'
    });
  } catch (error) {
    logger.error('Failed to get key info', error);
    return res.status(500).json({ error: 'Failed to retrieve encryption key information' });
  }
}