import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    DATABASE_URL: process.env.DATABASE_URL,
    databaseFileExists: require('fs').existsSync(process.env.DATABASE_URL?.replace('file:', '') || ''),
    cwd: process.cwd(),
    databasePath: process.env.DATABASE_URL?.replace('file:', ''),
    resolvedPath: require('path').resolve(process.env.DATABASE_URL?.replace('file:', '') || '')
  });
}