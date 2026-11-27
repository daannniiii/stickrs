// Vercel Serverless Function — Tags CRUD (Neon Lakebase Postgres)
import { ensureTables, getPool, setCors, slugify, verifyAdmin } from "./_db.js";

export default async function handler(req, res) {
  setCors(res, "GET, POST, PUT, DELETE, OPTIONS");
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

    if (req.method === "PUT") {
      const { id, label } = req.body || {};
      const oldId = String(id || "").trim();
      const trimmed = String(label || "").trim();
      const newId = slugify(trimmed);

      if (!oldId || !newId) {
        return res.status(400).json({ error: "Valid tag id and new label are required." });
      }

      const existing = await pool.query("SELECT id FROM tags WHERE id = $1", [oldId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Tag not found." });
      }

      // Check if newId is already taken by a different tag
      let targetId = newId;
      if (newId !== oldId) {
        const conflict = await pool.query("SELECT id FROM tags WHERE id = $1", [newId]);
        if (conflict.rows.length > 0) {
          // Keep oldId if slug collides with another existing tag
          targetId = oldId;
        }
      }

      const { rows } = await pool.query(
        `UPDATE tags
         SET id = $1, label = $2
         WHERE id = $3
         RETURNING id, label, created_at AS "createdAt"`,
        [targetId, trimmed, oldId]
      );

      if (targetId !== oldId) {
        await pool.query(
          `UPDATE products
           SET tags = array_replace(tags, $1, $2)
           WHERE $1 = ANY(tags)`,
          [oldId, targetId]
        );
      }

      return res.status(200).json({ tag: rows[0] });
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
