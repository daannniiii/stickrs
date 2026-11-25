// Vercel Serverless Function — Cloudinary Signed Upload
import crypto from "crypto";
import { setCors, verifyAdmin } from "./_db.js";

export default function handler(req, res) {
  setCors(res, "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin login required." });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return res.status(500).json({ error: "Cloudinary env vars not configured." });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "stickr-catalog";

  const paramsToSign = { folder, timestamp };
  const signatureString =
    Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join("&") + apiSecret;

  const signature = crypto
    .createHash("sha1")
    .update(signatureString)
    .digest("hex");

  return res.status(200).json({
    signature,
    timestamp,
    folder,
    api_key: apiKey,
    cloud_name: cloudName,
  });
}
