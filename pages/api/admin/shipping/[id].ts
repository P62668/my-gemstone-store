import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { withAdminAuth } from '../../../../utils/authMiddleware';
import { logger } from '../../../../utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    const { id } = req.query;
    const shippingMethodId = parseInt(id as string);

    if (req.method === 'GET') {
      try {
        const shippingMethod = await prisma.shipping.findUnique({
          where: { id: shippingMethodId },
        });

        if (!shippingMethod) {
          return res.status(404).json({ error: 'Shipping method not found' });
        }

        res.status(200).json(shippingMethod);
      } catch (error) {
        logger.error('Error fetching shipping method', error, {
          message: 'Failed to fetch shipping method',
          shippingMethodId,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });
        res.status(500).json({ error: 'Failed to fetch shipping method' });
      }
    } else if (req.method === 'PATCH') {
      try {
        const { name, description, price, freeAbove, active } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description?.trim() || null;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (freeAbove !== undefined) updateData.freeAbove = freeAbove ? parseFloat(freeAbove) : null;
        if (active !== undefined) updateData.active = Boolean(active);

        const shippingMethod = await prisma.shipping.update({
          where: { id: shippingMethodId },
          data: updateData,
        });

        logger.info('Shipping method updated successfully', {
          message: 'Shipping method updated',
          shippingMethodId: shippingMethod.id,
          shippingMethodName: shippingMethod.name,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        res.status(200).json(shippingMethod);
      } catch (error: any) {
        logger.error('Error updating shipping method', error, {
          message: 'Failed to update shipping method',
          shippingMethodId,
          requestBody: req.body,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        if (error.code === 'P2002') {
          res.status(409).json({ error: 'A shipping method with this name already exists' });
        } else if (error.code === 'P2025') {
          res.status(404).json({ error: 'Shipping method not found' });
        } else {
          res.status(500).json({ error: 'Failed to update shipping method' });
        }
      }
    } else if (req.method === 'DELETE') {
      try {
        await prisma.shipping.delete({
          where: { id: shippingMethodId },
        });

        logger.info('Shipping method deleted successfully', {
          message: 'Shipping method deleted',
          shippingMethodId,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        res.status(204).end();
      } catch (error: any) {
        logger.error('Error deleting shipping method', error, {
          message: 'Failed to delete shipping method',
          shippingMethodId,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        });

        if (error.code === 'P2025') {
          res.status(404).json({ error: 'Shipping method not found' });
        } else {
          res.status(500).json({ error: 'Failed to delete shipping method' });
        }
      }
    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('API Handler Error', req, error as Error);
    const statusCode = (error as any)?.statusCode || 500;
    const message = (error as any)?.message || 'Internal server error';
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  }
}

export default withAdminAuth(handler);