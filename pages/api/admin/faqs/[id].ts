import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../../../utils/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  const { id } = req.query;
  const faqId = parseInt(id as string);

  if (req.method === 'PATCH') {
    try {
      const { question, answer, order, active } = req.body;
      const faq = await prisma.fAQ.update({
        where: { id: faqId },
        data: {
          question,
          answer,
          order,
          active,
        },
      });
      res.status(200).json(faq);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Failed to update FAQ' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.fAQ.delete({
        where: { id: faqId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ error: 'Failed to delete FAQ' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
