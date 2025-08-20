import type { NextApiRequest, NextApiResponse } from "next";
// // import bcrypt from "bcryptjs";
import { enforceRateLimit } from "../../../utils/rateLimit";

// import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!enforceRateLimit(req, res, { max: 5, windowMs: 60_000, key: "reset_password" })) return;

  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password)
    return res.status(400).json({ error: "Token and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    // For now, we will skip token validation since emailVerifyToken field does not exist
    // In a production environment, you would implement proper token validation
    return res.status(200).json({ message: "Password reset functionality needs proper token implementation" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
    return res.status(500).json({ error: errorMessage });
  }
}
