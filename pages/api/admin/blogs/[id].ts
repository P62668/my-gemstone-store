import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../utils/auth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  const { id } = req.query;
  const blogId = parseInt(id as string);

  if (isNaN(blogId)) {
    return res.status(400).json({ error: 'Invalid blog ID' });
  }

  if (req.method === 'GET') {
    try {
      const blog = await prisma.blog.findUnique({
        where: { id: blogId },
      });

      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.status(200).json(blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({ error: 'Failed to fetch blog' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, slug, excerpt, content, status, featuredImage, tags, metaTitle, metaDescription } = req.body;
      
      // Validate required fields
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      // Generate slug if not provided
      const finalSlug = slug || title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');

      const blog = await prisma.blog.update({
        where: { id: blogId },
        data: {
          title,
          slug: finalSlug,
          excerpt,
          content,
          status: status || 'draft',
          featuredImage,
          tags,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          updatedAt: new Date(),
        },
      });

      res.status(200).json(blog);
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({ error: 'Failed to update blog' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.blog.delete({
        where: { id: blogId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Failed to delete blog' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}