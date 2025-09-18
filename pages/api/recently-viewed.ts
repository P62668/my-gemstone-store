import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = parseInt(session.user.id as string);

  switch (req.method) {
    case 'POST':
      try {
        const { gemstoneId } = req.body;

        if (!gemstoneId) {
          return res.status(400).json({ error: 'Gemstone ID is required' });
        }

        // Check if gemstone exists and is active
        const gemstone = await prisma.gemstone.findUnique({
          where: { id: parseInt(gemstoneId), active: true }
        });

        if (!gemstone) {
          return res.status(404).json({ error: 'Gemstone not found' });
        }

        // Add to recently viewed (upsert to handle duplicates)
        const recentlyViewed = await prisma.recentlyViewed.upsert({
          where: {
            userId_gemstoneId: {
              userId,
              gemstoneId: parseInt(gemstoneId)
            }
          },
          update: {
            viewedAt: new Date()
          },
          create: {
            userId,
            gemstoneId: parseInt(gemstoneId),
            viewedAt: new Date()
          }
        });

        // Limit to 20 most recent items
        const allItems = await prisma.recentlyViewed.findMany({
          where: { userId },
          orderBy: { viewedAt: 'desc' }
        });

        if (allItems.length > 20) {
          // Delete the oldest items
          const itemsToDelete = allItems.slice(20);
          await prisma.recentlyViewed.deleteMany({
            where: {
              id: {
                in: itemsToDelete.map(item => item.id)
              }
            }
          });
        }

        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error adding to recently viewed:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'GET':
      try {
        const recentlyViewed = await prisma.recentlyViewed.findMany({
          where: { userId },
          orderBy: { viewedAt: 'desc' },
          take: 8,
          include: {
            gemstone: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true
              }
            }
          }
        });

        // Fix the data structure to match what the component expects
        const formattedData = recentlyViewed.map(item => {
          // Parse images string to array
          let imagesArray: string[] = [];
          try {
            if (typeof item.gemstone.images === 'string') {
              imagesArray = JSON.parse(item.gemstone.images);
            } else {
              imagesArray = Array.isArray(item.gemstone.images) ? item.gemstone.images : [];
            }
          } catch (parseError) {
            console.warn('Failed to parse images for gemstone:', item.gemstone.id);
            imagesArray = [];
          }

          return {
            id: item.gemstone.id,
            name: item.gemstone.name,
            price: item.gemstone.price,
            images: imagesArray
          };
        });

        res.status(200).json(formattedData);
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}