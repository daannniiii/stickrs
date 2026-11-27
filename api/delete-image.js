// Vercel Serverless Function — Delete Image from Cloudinary
import { destroyCloudinaryImage } from "./_cloudinary.js";
import { setCors, verifyAdmin } from "./_db.js";

export default async function handler(req, res) {
  setCors(res, "POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized. Admin login required." });
  }

  try {
    const { publicId, imageUrl } = req.body || {};
    if (!publicId && !imageUrl) {
      return res.status(400).json({ error: "publicId or imageUrl is required." });
    }
    const result = await destroyCloudinaryImage({ publicId, imageUrl });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Delete image error:", err);
    return res.status(500).json({ error: err.message || "Failed to delete image." });
  }
}
