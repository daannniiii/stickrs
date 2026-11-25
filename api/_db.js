import crypto from "crypto";
import pg from "pg";
import { attachDatabasePool } from "@vercel/functions";

const { Pool } = pg;

let pool;
let tablesInitialized = false;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not configured. Add DATABASE_URL in Vercel Project Settings -> Environment Variables."
      );
    }
    pool = new Pool({ connectionString });
    try {
      attachDatabasePool(pool);
    } catch {
      // Safe no-op outside Vercel Fluid compute
    }
  }
  return pool;
}

export async function ensureTables(activePool) {
  if (tablesInitialized) return;
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await activePool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      inventory_count INTEGER NOT NULL DEFAULT 0,
      tags TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  tablesInitialized = true;
}

export function setCors(res, methods = "GET, POST, PUT, DELETE, OPTIONS") {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export function computeAdminToken() {
  const secret = process.env.ADMIN_PASSWORD || "";
  if (!secret) return "";
  return crypto
    .createHmac("sha256", secret)
    .update("stickr-admin-session-v1")
    .digest("hex");
}

export function verifyAdmin(req) {
  const expected = computeAdminToken();
  if (!expected) return false;
  const authHeader = req.headers?.authorization || req.headers?.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function slugify(label) {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
