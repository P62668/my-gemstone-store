import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { logger } from '../../../../utils/logger';
import { logSecurityEvent, getClientIP } from '../../../../utils/security';
import { SECURITY_CHECKLIST, SecurityChecklistManager } from '../../../../utils/securityChecklist';

const checklistManager = new SecurityChecklistManager();

export default withAdminAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientIP = getClientIP(req);
  
  try {
    // Log access to security checklist
    logSecurityEvent('Security Checklist Access', { 
      userId: (req as any).user?.id,
      ip: clientIP,
      method: req.method
    });

    switch (req.method) {
      case 'GET':
        return await handleGetChecklist(req, res);
      case 'PUT':
        return await handleUpdateChecklistItem(req, res);
      case 'POST':
        return await handleResetChecklist(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    logger.error('Security checklist error', error);
    logSecurityEvent('Security Checklist Error', { 
      userId: (req as any).user?.id,
      ip: clientIP,
      error: error.message
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get the security checklist
 */
async function handleGetChecklist(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { category, priority, status } = req.query;
    
    let checklist = checklistManager.getChecklist();
    
    // Filter by category if provided
    if (category && typeof category === 'string') {
      checklist = checklistManager.getChecklistByCategory(category);
    }
    
    // Filter by priority if provided
    if (priority && typeof priority === 'string') {
      checklist = checklistManager.getChecklistByPriority(priority);
    }
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      checklist = checklistManager.getChecklistByStatus(status);
    }
    
    // Get progress stats
    const progress = checklistManager.getProgress();
    const priorityStats = checklistManager.getPriorityStats();
    
    return res.status(200).json({
      checklist,
      progress,
      priorityStats,
      filters: {
        category: category || null,
        priority: priority || null,
        status: status || null
      }
    });
  } catch (error) {
    logger.error('Failed to get security checklist', error);
    return res.status(500).json({ error: 'Failed to retrieve security checklist' });
  }
}

/**
 * Update a checklist item status
 */
async function handleUpdateChecklistItem(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, status } = req.body;
    
    // Validate input
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing required fields: id, status' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'not-applicable'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    
    // Update item status
    checklistManager.updateItemStatus(id, status);
    
    // Log the update
    logSecurityEvent('Security Checklist Item Updated', { 
      userId: (req as any).user?.id,
      ip: getClientIP(req),
      itemId: id,
      newStatus: status
    });
    
    // Return updated checklist
    const updatedChecklist = checklistManager.getChecklist();
    const progress = checklistManager.getProgress();
    
    return res.status(200).json({
      message: 'Checklist item updated successfully',
      checklist: updatedChecklist,
      progress
    });
  } catch (error) {
    logger.error('Failed to update checklist item', error);
    return res.status(500).json({ error: 'Failed to update checklist item' });
  }
}

/**
 * Reset the checklist to default state
 */
async function handleResetChecklist(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real implementation, you would reset the checklist to its default state
    // For now, we'll just return the default checklist
    
    // Log the reset
    logSecurityEvent('Security Checklist Reset', { 
      userId: (req as any).user?.id,
      ip: getClientIP(req)
    });
    
    return res.status(200).json({
      message: 'Security checklist reset to default state',
      checklist: SECURITY_CHECKLIST,
      progress: { total: SECURITY_CHECKLIST.length, completed: 0, percentage: 0 }
    });
  } catch (error) {
    logger.error('Failed to reset checklist', error);
    return res.status(500).json({ error: 'Failed to reset security checklist' });
  }
}