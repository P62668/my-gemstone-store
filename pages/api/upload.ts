import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { withAdminAuth } from '../../utils/authMiddleware';
import { logger } from '../../utils/logger';

export const config = {
  api: {
    bodyParser: false,
  },
};

const imagesDir = path.join(process.cwd(), 'public', 'images', 'uploads');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure multer with enhanced error handling
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(sanitizedFilename));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Invalid file extension. Allowed: jpg, jpeg, png, gif, webp'));
    }
    
    cb(null, true);
  },
});

// Enhanced promise-based wrapper for multer
const uploadMiddleware = (req: any, res: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(req.file);
      }
    });
  });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Admin user is attached by withAdminAuth
    const adminUser = (req as any).user;
    if (!adminUser) return res.status(401).json({ success: false, error: 'Authentication required' });

    // Handle file upload
    const file = await uploadMiddleware(req, res);
    
    if (!file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false,
        error: 'File size must be less than 10MB' 
      });
    }

    const fileUrl = `/images/uploads/${file.filename}`;
    
    // Log successful upload
    logger.info('File uploaded successfully', {
      message: 'Admin file upload successful',
      fileName: file.originalname,
      fileSize: file.size,
      fileUrl: fileUrl,
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ 
      success: true,
      url: fileUrl,
      fileName: file.originalname,
      fileSize: file.size
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    logger.error('Upload error', {
      message: 'File upload failed',
      errorMessage,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    });
    
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ 
        success: false,
        error: 'Only image files are allowed' 
      });
    }
    
    if (error.message === 'Invalid file extension. Allowed: jpg, jpeg, png, gif, webp') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid file extension. Allowed: jpg, jpeg, png, gif, webp' 
      });
    }
    
    if (error.message === 'File too large') {
      return res.status(400).json({ 
        success: false,
        error: 'File size must be less than 10MB' 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Upload failed. Please try again.' 
    });
  }
}

export default withAdminAuth(handler);
