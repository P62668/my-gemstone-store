import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        message: 'DATABASE_URL environment variable is not set',
      });
    }
    
    // Extract the file path from the database URL
    const filePath = databaseUrl.replace('file:', '');
    const absolutePath = path.resolve(filePath);
    
    // Check if the file exists
    const fileExists = fs.existsSync(absolutePath);
    
    // Get file stats if it exists
    let fileStats: { size: number; modified: Date; isFile: boolean; } | null = null;
    if (fileExists) {
      const stats = fs.statSync(absolutePath);
      fileStats = {
        size: stats.size,
        modified: stats.mtime,
        isFile: stats.isFile(),
      };
    }
    
    res.status(200).json({
      success: true,
      databaseUrl: databaseUrl,
      filePath: filePath,
      absolutePath: absolutePath,
      fileExists: fileExists,
      fileStats: fileStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking database file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}