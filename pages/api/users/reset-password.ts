import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "../../../utils/rateLimit";
import { getEnv, requireEnv } from "../../../utils/env";

import { prisma } from '../../../lib/prisma';

const JWT_SECRET = process.env.NODE_ENV === 'production' ? requireEnv('JWT_SECRET') : getEnv('JWT_SECRET') || 'dev-secret';

interface ResetTokenPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  const rl = await rateLimit({ max: 5, windowMs: 60_000, key: "reset_password" })(req, res);
  if (!rl.success) return res.status(429).json({ error: 'Too many requests' });

  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password)
    return res.status(400).json({ error: "Token and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    
    // Check if token is expired (1 hour)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return res.status(400).json({ error: "Password reset token has expired" });
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: decoded.email }
    });
    
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    // Check if user ID matches
    if (user.id !== decoded.userId) {
      return res.status(400).json({ error: "Invalid token" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    return res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Password reset token has expired" });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: "Invalid password reset token" });
    }
    
    console.error('Password reset error:', err);
    const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
    return res.status(500).json({ error: errorMessage });
  }
}