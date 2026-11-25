// Vercel Serverless Function — Tags CRUD (Neon Lakebase Postgres)
import { ensureTables, getPool, setCors, slugify, verifyAdmin } from "./_db.js";

export default async function handler(req, res) {
  setCors(res, "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const pool = getPool();
    await ensureTables(pool);

    if (req.method === "GET") {
      const { rows } = await pool.query(
        `SELECT t.id, t.label, t.created_at AS "createdAt",
                COUNT(p.id)::int AS count
         FROM tags t
         LEFT JOIN products p ON t.id = ANY(p.tags)
         GROUP BY t.id, t.label, t.created_at
         ORDER BY t.created_at ASC, t.label ASC`
      );
      return res.status(200).json({ tags: rows });
    }

    if (!verifyAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized. Admin login required." });
    }

    if (req.method === "POST") {
      const { label } = req.body || {};
      const trimmed = String(label || "").trim();
      const id = slugify(trimmed);
      if (!id) {
        return res.status(400).json({ error: "Tag label cannot be empty." });
      }

      const { rows } = await pool.query(
        `INSERT INTO tags (id, label)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label
         RETURNING id, label, created_at AS "createdAt"`,
        [id, trimmed]
      );
      return res.status(201).json({ tag: { ...rows[0], count: 0 } });
    }

    if (req.method === "DELETE") {
      const idParam = req.query?.id ?? req.body?.id;
      const id = String(idParam || "").trim();
      if (!id) {
        return res.status(400).json({ error: "Tag id is required." });
      }
      await pool.query("DELETE FROM tags WHERE id = $1", [id]);
      await pool.query("UPDATE products SET tags = array_remove(tags, $1) WHERE $1 = ANY(tags)", [id]);
      return res.status(200).json({ deletedId: id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Tags API error:", err);
    return res.status(500).json({ error: err.message || "Database error" });
  }
}
