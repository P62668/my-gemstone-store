import { NextApiRequest, NextApiResponse } from 'next';

const subscribers: string[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  // For now, just store in memory (not persistent)
  subscribers.push(email);
  return res.status(200).json({ message: 'Subscribed successfully!' });
}
