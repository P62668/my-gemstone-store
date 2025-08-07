import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../utils/auth';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let userId;
  let user;
  try {
    console.log('[API/orders] Request headers:', req.headers);
    user = getUserFromRequest(req);
    userId = user.id;
    console.log('[API/orders] Decoded user:', user);
  } catch (err: any) {
    console.error('[API/orders] Auth error:', err);
    if (err.message === 'Not authenticated' || err.message === 'Invalid or expired token') {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }

  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              gemstone: {
                select: {
                  name: true,
                  type: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      const parsedOrders = orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          ...item,
          gemstone: {
            ...item.gemstone,
            images: Array.isArray(item.gemstone.images)
              ? item.gemstone.images
              : JSON.parse(item.gemstone.images || '[]'),
          },
        })),
      }));
      console.log(
        '[API/orders] userId:',
        userId,
        'orders.length:',
        parsedOrders.length,
        'orders:',
        parsedOrders,
      );
      res.status(200).json(parsedOrders);
    } catch (error) {
      console.error('[API/orders] Error fetching orders for user', userId, error, error?.stack);
      res.status(500).json({ error: 'Failed to fetch orders', details: error?.message || error });
    }
  } else if (req.method === 'POST') {
    try {
      const { items, total, status = 'paid' } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must have at least one item.' });
      }
      if (typeof total !== 'number' || total <= 0) {
        return res.status(400).json({ error: 'Invalid total amount.' });
      }
      // Validate each item
      for (const item of items) {
        if (!item.gemstoneId || typeof item.quantity !== 'number' || item.quantity <= 0) {
          return res.status(400).json({ error: 'Invalid order item.' });
        }
        // Check if gemstone exists
        const gemstone = await prisma.gemstone.findUnique({
          where: { id: Number(item.gemstoneId) },
        });
        if (!gemstone) {
          return res
            .status(400)
            .json({ error: `Gemstone with id ${item.gemstoneId} does not exist.` });
        }
      }
      // Create order and items
      const order = await prisma.order.create({
        data: {
          userId,
          total,
          status,
          items: {
            create: items.map((item) => ({
              gemstoneId: item.gemstoneId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Fetch user info for email
      let emailWarning = null;
      try {
        const userInfo = await prisma.user.findUnique({ where: { id: userId } });
        // Send email notifications (Nodemailer, dev only)
        if (userInfo && userInfo.email) {
          const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
              user: process.env.ETHEREAL_USER,
              pass: process.env.ETHEREAL_PASS,
            },
          });
          // User confirmation email
          await transporter.sendMail({
            from: 'no-reply@shankarmala.com',
            to: userInfo.email,
            subject: `Order Confirmation - Shankarmala Order #${order.id}`,
            html: `<h2>Thank you for your order!</h2><p>Your order #${order.id} has been placed successfully.</p><p>Total: ₹${order.total.toLocaleString('en-IN')}</p>`,
          });
          // Admin notification email
          await transporter.sendMail({
            from: 'no-reply@shankarmala.com',
            to: 'admin@shankarmala.com',
            subject: `New Order Placed - Order #${order.id}`,
            html: `<h2>New order received</h2><p>Order #${order.id} by ${userInfo.email}</p><p>Total: ₹${order.total.toLocaleString('en-IN')}</p>`,
          });
        }
      } catch (emailErr) {
        emailWarning = 'Order placed, but failed to send confirmation email.';
        console.warn('[API/orders] Email warning:', emailErr);
      }
      console.log('[API/orders] Created order:', order);
      res.status(201).json({ ...order, emailWarning });
    } catch (error) {
      console.error('[API/orders] Error creating order for user', userId, error, error?.stack);
      res.status(500).json({ error: 'Failed to create order', details: error?.message || error });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
