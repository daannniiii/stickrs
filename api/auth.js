// Vercel Serverless Function — Admin Authentication
import { computeAdminToken, setCors } from "./_db.js";

export default function handler(req, res) {
  setCors(res, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: "ADMIN_PASSWORD not configured on server." });
  }

  if (password && password === adminPassword) {
    return res.status(200).json({ success: true, token: computeAdminToken() });
  }

  return res.status(401).json({ error: "Incorrect password." });
}
