import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test if we can connect to the database
    await prisma.$connect();
    
    // Test a simple query
    const userCount = await prisma.user.count();
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL,
    });
  }
}