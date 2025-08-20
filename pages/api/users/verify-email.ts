import type { NextApiRequest, NextApiResponse } from "next";
import { enforceRateLimit } from "../../../utils/rateLimit";
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!enforceRateLimit(req, res, { max: 20, windowMs: 60_000, key: "verify_email" })) return;

  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    // For now, we will skip token validation since emailVerifyToken field does not exist
    // In a production environment, you would implement proper token validation
    return res.status(200).json({ message: "Email verification functionality needs proper token implementation" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to verify email" });
  }
}
