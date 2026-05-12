#!/usr/bin/env node
/**
 * Apply a SQL migration file directly to the Supabase Postgres database.
 *
 * Usage:
 *   node scripts/run-migration.mjs supabase/migrations/001_initial_schema.sql
 *
 * Reads env vars from .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL    (parsed for the project ref)
 *   - SUPABASE_DB_PASSWORD        (the Postgres password, NOT the API keys)
 *
 * Connects via the Supabase Session-mode pooler at
 *   aws-1-us-west-2.pooler.supabase.com:5432
 * with user `postgres.<ref>`. SSL required.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// --- Load .env.local (no dotenv dep) ------------------------------------------
const envPath = path.join(root, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("[run-migration] Missing .env.local at", envPath);
  process.exit(1);
}
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!supabaseUrl || !dbPassword) {
  console.error(
    "[run-migration] Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD in .env.local",
  );
  process.exit(1);
}

// Extract project ref from URL: https://<ref>.supabase.co → <ref>
const ref = new URL(supabaseUrl).hostname.split(".")[0];

// Pooler host (probed earlier — region is encoded in the hostname).
const host = "aws-1-us-west-2.pooler.supabase.com";
const port = 5432;
const user = `postgres.${ref}`;

// --- Read the migration file --------------------------------------------------
const migrationArg = process.argv[2];
if (!migrationArg) {
  console.error("[run-migration] Pass a migration file path as the first arg");
  process.exit(1);
}
const migrationPath = path.resolve(root, migrationArg);
if (!fs.existsSync(migrationPath)) {
  console.error("[run-migration] No file at", migrationPath);
  process.exit(1);
}
const sql = fs.readFileSync(migrationPath, "utf8");

console.log(`[run-migration] Applying ${migrationArg}`);
console.log(`[run-migration] → ${host}:${port} as ${user}`);

// --- Connect and execute ------------------------------------------------------
const client = new pg.Client({
  host,
  port,
  user,
  password: dbPassword,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 8000,
});

try {
  await client.connect();
  console.log("[run-migration] Connected.");
  await client.query(sql);
  console.log("[run-migration] Migration executed successfully.");

  // Verify
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public'
     ORDER BY table_name;`,
  );
  console.log(`[run-migration] Tables in public schema (${rows.length}):`);
  for (const r of rows) console.log("  •", r.table_name);
} catch (e) {
  console.error("[run-migration] FAILED:", e.message);
  if (e.position) console.error("[run-migration] At position", e.position);
  process.exitCode = 1;
} finally {
  await client.end();
}
