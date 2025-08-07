import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../../../utils/auth';
import { handleApiError } from '../../../../utils/errorHandler';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  const { id } = req.query;
  const orderId = Number(id);
  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  const { status } = req.body;
  const allowedStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  try {
    // Fetch order and user info before update
    const orderBefore = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!orderBefore) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderBefore.status === status) {
      return res.status(200).json(orderBefore); // No change
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Add to status history (optional - don't fail if this fails)
    try {
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          status,
        },
      });
    } catch (historyError) {
      console.error('Failed to create status history:', historyError);
      // Continue even if history creation fails
    }

    // Send email notification to user (optional - don't fail if email fails)
    if (orderBefore.user && orderBefore.user.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASS,
          },
        });

        await transporter.sendMail({
          from: 'no-reply@shankarmala.com',
          to: orderBefore.user.email,
          subject: `Order #${order.id} Status Updated - Shankarmala`,
          html: `<h2>Your order #${order.id} status has been updated</h2><p>New status: <b>${status.charAt(0).toUpperCase() + status.slice(1)}</b></p>`,
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Order status update error:', error);
    handleApiError(error, req, res);
    return;
  }
}
