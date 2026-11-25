import crypto from "crypto";
import pg from "pg";
import { attachDatabasePool } from "@vercel/functions";

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not configured.");
    }
    pool = new Pool({ connectionString });
    attachDatabasePool(pool);
  }
  return pool;
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
