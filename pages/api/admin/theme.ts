import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../utils/auth';

// For now, we'll use a simple in-memory approach
// In a production environment, you'd want to use a proper database

let themeSettings = {
  colors: {
    primary: '#d97706',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    background: '#fefefe',
    text: '#1f2937',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fonts: {
    heading: 'serif',
    body: 'system-ui',
    accent: 'cursive',
  },
  spacing: {
    container: 'max-w-7xl',
    section: 'py-16',
    element: 'p-6',
  },
  borderRadius: {
    small: 'rounded-lg',
    medium: 'rounded-xl',
    large: 'rounded-2xl',
  },
  shadows: {
    small: 'shadow-md',
    medium: 'shadow-lg',
    large: 'shadow-xl',
  },
  animations: {
    duration: '300ms',
    easing: 'ease-in-out',
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
  } catch (err: any) {
    return res.status(err.message.includes('Forbidden') ? 403 : 401).json({ error: err.message });
  }

  if (req.method === 'GET') {
    try {
      res.status(200).json(themeSettings);
    } catch (error) {
      console.error('Error fetching theme settings:', error);
      res.status(500).json({ error: 'Failed to fetch theme settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const themeData = req.body;

      // Validate required fields
      if (!themeData.colors || !themeData.fonts || !themeData.spacing) {
        return res.status(400).json({ error: 'Colors, fonts, and spacing are required' });
      }

      // Validate color format
      const validateColor = (color: string) => {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
      };

      for (const [key, value] of Object.entries(themeData.colors)) {
        if (typeof value !== 'string' || !validateColor(value)) {
          return res.status(400).json({ error: `Invalid color format for ${key}` });
        }
      }

      // Update settings
      themeSettings = { ...themeSettings, ...themeData };

      res.status(200).json({ message: 'Theme settings updated successfully' });
    } catch (error) {
      console.error('Error updating theme settings:', error);
      res.status(500).json({ error: 'Failed to update theme settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
