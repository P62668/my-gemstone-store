import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { logger } from '../../../../utils/logger';
import { logSecurityEvent, getClientIP } from '../../../../utils/security';
import SecurityScanner from '../../../../utils/securityScanner';

const scanner = new SecurityScanner();

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientIP = getClientIP(req);
  
  try {
    // Log access to security scanner
    logSecurityEvent('Security Scanner Access', { 
      userId: (req as any).user?.id,
      ip: clientIP,
      method: req.method
    });

    switch (req.method) {
      case 'POST':
        return await handleRunScan(req, res);
      case 'GET':
        return await handleGetLastScan(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    logger.error('Security scanner error', error);
    logSecurityEvent('Security Scanner Error', { 
      userId: (req as any).user?.id,
      ip: clientIP,
      error: error.message
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Run a security scan
 */
async function handleRunScan(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Log the scan initiation
    logSecurityEvent('Security Scan Initiated', { 
      userId: (req as any).user?.id,
      ip: getClientIP(req)
    });
    
    // Run the security scan
    const results = await scanner.scanProject();
    
    // Log scan completion
    logSecurityEvent('Security Scan Completed', { 
      userId: (req as any).user?.id,
      ip: getClientIP(req),
      score: results.score,
      vulnerabilityCount: results.vulnerabilities.length
    });
    
    // In a real application, you might want to store the results in a database
    // For now, we'll just return them
    
    return res.status(200).json({
      message: 'Security scan completed successfully',
      results
    });
  } catch (error) {
    logger.error('Failed to run security scan', error);
    return res.status(500).json({ error: 'Failed to run security scan' });
  }
}

/**
 * Get the last security scan results
 */
async function handleGetLastScan(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real application, you would retrieve the last scan results from a database
    // For now, we'll return a placeholder response
    
    return res.status(200).json({
      message: 'Last security scan results would be returned here',
      lastScan: null
    });
  } catch (error) {
    logger.error('Failed to get last scan results', error);
    return res.status(500).json({ error: 'Failed to retrieve last scan results' });
  }
}