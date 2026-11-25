// Vercel Serverless Function — Products CRUD (Neon Lakebase Postgres)
import { getPool, setCors, verifyAdmin } from "./_db.js";

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    image: row.image_url,
    inventoryCount: row.inventory_count,
    tags: row.tags || [],
    category: row.tags?.[0] || "",
    createdAt: row.created_at,
  };
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const pool = getPool();

  try {
    if (req.method === "GET") {
      const { rows } = await pool.query(
        `SELECT id, name, image_url, inventory_count, tags, created_at
         FROM products
         ORDER BY created_at DESC, id DESC`
      );
      return res.status(200).json({ products: rows.map(mapProduct) });
    }

    if (!verifyAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized. Admin login required." });
    }

    if (req.method === "POST") {
      const { name, image, inventoryCount, tags } = req.body || {};
      if (!name || !String(name).trim() || !image || !String(image).trim()) {
        return res.status(400).json({ error: "Product name and image URL are required." });
      }
      const cleanTags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : [];
      const count = Math.max(0, Number.parseInt(inventoryCount ?? 0, 10) || 0);

      const { rows } = await pool.query(
        `INSERT INTO products (name, image_url, inventory_count, tags)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, image_url, inventory_count, tags, created_at`,
        [String(name).trim(), String(image).trim(), count, cleanTags]
      );
      return res.status(201).json({ product: mapProduct(rows[0]) });
    }

    if (req.method === "PUT") {
      const { id, name, image, inventoryCount, tags } = req.body || {};
      const numericId = Number.parseInt(id, 10);
      if (!numericId) {
        return res.status(400).json({ error: "Valid product id is required." });
      }

      const existing = await pool.query(
        `SELECT id, name, image_url, inventory_count, tags FROM products WHERE id = $1`,
        [numericId]
      );
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Product not found." });
      }
      const prev = existing.rows[0];

      const nextName = name !== undefined ? String(name).trim() : prev.name;
      const nextImage = image !== undefined ? String(image).trim() : prev.image_url;
      const nextCount =
        inventoryCount !== undefined
          ? Math.max(0, Number.parseInt(inventoryCount, 10) || 0)
          : prev.inventory_count;
      const nextTags =
        tags !== undefined
          ? (Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [])
          : prev.tags;

      const { rows } = await pool.query(
        `UPDATE products
         SET name = $1, image_url = $2, inventory_count = $3, tags = $4
         WHERE id = $5
         RETURNING id, name, image_url, inventory_count, tags, created_at`,
        [nextName, nextImage, nextCount, nextTags, numericId]
      );
      return res.status(200).json({ product: mapProduct(rows[0]) });
    }

    if (req.method === "DELETE") {
      const idParam = req.query?.id ?? req.body?.id;
      const numericId = Number.parseInt(idParam, 10);
      if (!numericId) {
        return res.status(400).json({ error: "Valid product id is required." });
      }
      const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [numericId]);
      if (rowCount === 0) {
        return res.status(404).json({ error: "Product not found." });
      }
      return res.status(200).json({ deletedId: numericId });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Products API error:", err);
    return res.status(500).json({ error: err.message || "Database error" });
  }
}
