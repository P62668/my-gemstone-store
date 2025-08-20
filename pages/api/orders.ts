import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';
import nodemailer from 'nodemailer';

import { prisma } from '../../lib/prisma';

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const userId = user.id;

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
                  certificate: true,
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
        items: order.items.map((item) => {
          let parsedImages = [];
          try {
            if (typeof item.gemstone.images === 'string' && item.gemstone.images.trim()) {
              parsedImages = JSON.parse(item.gemstone.images);
            } else if (Array.isArray(item.gemstone.images)) {
              parsedImages = item.gemstone.images;
            }
          } catch (error) {
            console.error('Error parsing images for gemstone:', item.gemstone.name, error);
            parsedImages = [];
          }
          
          return {
            ...item,
            gemstone: {
              ...item.gemstone,
              images: parsedImages,
            },
          };
        }),
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
      console.error('[API/orders] Error fetching orders for user', userId, error);
      res.status(500).json({ error: 'Failed to fetch orders' });
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
      // Generate unique order number
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderNumber = `SM-${timestamp}-${random}`;

      // Create order and items
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber,
          total,
          status,
          shippingAddress: JSON.stringify({}), // Default empty address
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
      console.error('[API/orders] Error creating order for user', userId, error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
