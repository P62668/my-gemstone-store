import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../utils/authMiddleware';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'GET') {
      const { gemstoneId } = req.query;
      
      if (!gemstoneId) {
        return res.status(400).json({ error: 'Gemstone ID required' });
      }
      
      // Get all reviews for a specific gemstone
      const reviews = await prisma.review.findMany({
        where: { gemstoneId: Number(gemstoneId) },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      res.status(200).json({
        reviews,
        averageRating,
        totalReviews: reviews.length
      });
    } else if (req.method === 'POST') {
      const { gemstoneId, rating, comment } = req.body;
      
      // Validate input
      if (!gemstoneId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Valid gemstone ID and rating (1-5) required' });
      }
      
      // Check if user has purchased this gemstone
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          orderId: {
            not: undefined
          },
          gemstoneId: Number(gemstoneId),
          order: {
            userId: user.id,
            status: 'DELIVERED'
          }
        }
      });
      
      if (!orderItem) {
        return res.status(400).json({ error: 'You must purchase this item before reviewing it' });
      }
      
      // Check if user has already reviewed this gemstone
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: user.id,
          gemstoneId: Number(gemstoneId)
        }
      });
      
      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this item' });
      }
      
      // Create review
      const review = await prisma.review.create({
        data: {
          userId: user.id,
          gemstoneId: Number(gemstoneId),
          rating: Number(rating),
          comment: comment || '',
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      });
      
      // Update gemstone's average rating
      const gemstoneReviews = await prisma.review.findMany({
        where: { gemstoneId: Number(gemstoneId) }
      });
      
      const totalRating = gemstoneReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = gemstoneReviews.length > 0 ? totalRating / gemstoneReviews.length : 0;
      
      await prisma.gemstone.update({
        where: { id: Number(gemstoneId) },
        data: { averageRating }
      });
      
      res.status(200).json(review);
    } else if (req.method === 'PUT') {
      const { reviewId, rating, comment } = req.body;
      
      // Validate input
      if (!reviewId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Valid review ID and rating (1-5) required' });
      }
      
      // Check if review belongs to user
      const review = await prisma.review.findUnique({
        where: { id: Number(reviewId) }
      });
      
      if (!review || review.userId !== user.id) {
        return res.status(403).json({ error: 'You can only edit your own reviews' });
      }
      
      // Update review
      const updatedReview = await prisma.review.update({
        where: { id: Number(reviewId) },
        data: {
          rating: Number(rating),
          comment: comment || '',
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      });
      
      // Update gemstone's average rating
      const gemstoneReviews = await prisma.review.findMany({
        where: { gemstoneId: review.gemstoneId }
      });
      
      const totalRating = gemstoneReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = gemstoneReviews.length > 0 ? totalRating / gemstoneReviews.length : 0;
      
      await prisma.gemstone.update({
        where: { id: review.gemstoneId },
        data: { averageRating }
      });
      
      res.status(200).json(updatedReview);
    } else if (req.method === 'DELETE') {
      const { reviewId } = req.body;
      
      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID required' });
      }
      
      // Check if review belongs to user
      const review = await prisma.review.findUnique({
        where: { id: Number(reviewId) }
      });
      
      if (!review || review.userId !== user.id) {
        return res.status(403).json({ error: 'You can only delete your own reviews' });
      }
      
      // Delete review
      await prisma.review.delete({
        where: { id: Number(reviewId) }
      });
      
      // Update gemstone's average rating
      const gemstoneReviews = await prisma.review.findMany({
        where: { gemstoneId: review.gemstoneId }
      });
      
      const totalRating = gemstoneReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = gemstoneReviews.length > 0 ? totalRating / gemstoneReviews.length : 0;
      
      await prisma.gemstone.update({
        where: { id: review.gemstoneId },
        data: { averageRating }
      });
      
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Reviews API error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);