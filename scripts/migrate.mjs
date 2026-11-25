// Schema migration & initial seed script.
// Uses DATABASE_URL_UNPOOLED (direct connection) per Neon Postgres best practices.

import fs from "fs";
import path from "path";
import pg from "pg";
import { categories, products } from "../src/data/catalogData.js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: DATABASE_URL_UNPOOLED or DATABASE_URL is not set.");
  process.exit(1);
}

const client = new pg.Client({ connectionString });

async function migrate() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        inventory_count INTEGER NOT NULL DEFAULT 0,
        tags TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed tags if table is empty
    const { rows: tagCountRows } = await client.query(
      "SELECT COUNT(*)::int AS count FROM tags"
    );
    if (tagCountRows[0].count === 0) {
      for (const cat of categories) {
        await client.query(
          "INSERT INTO tags (id, label) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
          [cat.id, cat.label]
        );
      }
      console.log(`Seeded ${categories.length} tags.`);
    }

    // Seed products if table is empty
    const { rows: prodCountRows } = await client.query(
      "SELECT COUNT(*)::int AS count FROM products"
    );
    if (prodCountRows[0].count === 0) {
      for (const prod of products) {
        const prodTags = Array.isArray(prod.tags)
          ? prod.tags
          : prod.category
            ? [prod.category]
            : [];
        await client.query(
          `INSERT INTO products (name, image_url, inventory_count, tags)
           VALUES ($1, $2, $3, $4)`,
          [prod.name, prod.image, prod.inventoryCount ?? 10, prodTags]
        );
      }
      console.log(`Seeded ${products.length} products.`);
    }

    console.log("Migration completed successfully.");
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
