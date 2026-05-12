#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const line of fs
  .readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
  .split("\n")) {
  const eq = line.indexOf("=");
  if (eq === -1 || line.trim().startsWith("#")) continue;
  process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const ref = "cxiliaaqngamntmbwlaw";
const password = process.env.SUPABASE_DB_PASSWORD;
const host = "aws-1-us-west-2.pooler.supabase.com";

const variants = [
  { user: `postgres.${ref}`, port: 5432 },
  { user: `postgres.${ref}`, port: 6543 },
  { user: "postgres", port: 5432 },
  { user: "postgres", port: 6543 },
  { user: `${ref}.postgres`, port: 5432 },
];

for (const v of variants) {
  const c = new pg.Client({
    host,
    port: v.port,
    user: v.user,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await c.connect();
    const { rows } = await c.query("SELECT 1 as ok");
    console.log(`✓ ${host}:${v.port} user=${v.user} rows=${rows.length}`);
    await c.end();
    process.exit(0);
  } catch (e) {
    console.log(`✗ ${host}:${v.port} user=${v.user} — ${e.message.split("\n")[0]}`);
    try {
      await c.end();
    } catch {}
  }
}
process.exit(1);
