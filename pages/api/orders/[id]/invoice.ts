import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '../../../../utils/auth';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { id } = req.query;
  let user;
  try {
    user = getUserFromRequest(req);
  } catch (err) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const orderId = Number(id);
  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            gemstone: true,
          },
        },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // PDF generation
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-order-${order.id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    // Header
    doc.fontSize(24).fillColor('#b45309').text('Shankarmala Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).fillColor('black').text(`Order ID: #${order.id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Customer: ${order.user.name} (${order.user.email})`);
    doc.moveDown();
    // Items
    doc.fontSize(16).fillColor('#b45309').text('Items:', { underline: true });
    doc.moveDown(0.5);
    order.items.forEach((item, i) => {
      doc
        .fontSize(12)
        .fillColor('black')
        .text(
          `${i + 1}. ${item.gemstone.name} x${item.quantity} - ₹${item.price.toLocaleString('en-IN')}`,
        );
    });
    doc.moveDown();
    // Total
    doc
      .fontSize(16)
      .fillColor('#15803d')
      .text(`Total: ₹${order.total.toLocaleString('en-IN')}`);
    doc.moveDown(2);
    doc
      .fontSize(12)
      .fillColor('gray')
      .text('Thank you for shopping with Shankarmala!', { align: 'center' });
    doc.end();
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to generate invoice', details: (error as any)?.message || error });
  }
}
