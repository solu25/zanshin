#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Load .env.local
for (const line of fs
  .readFileSync(path.join(root, ".env.local"), "utf8")
  .split("\n")) {
  const eq = line.indexOf("=");
  if (eq === -1 || line.trim().startsWith("#")) continue;
  process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const ref = "cxiliaaqngamntmbwlaw";
const password = process.env.SUPABASE_DB_PASSWORD;

// Candidate connection configs to try
const candidates = [
  // Direct connections
  { host: `db.${ref}.supabase.co`, user: "postgres", port: 5432 },
  // Pooler session-mode (port 5432) across regions
  ...[
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-west-2",
    "eu-central-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
    "ap-south-1",
  ].flatMap((region) => [
    {
      host: `aws-0-${region}.pooler.supabase.com`,
      user: `postgres.${ref}`,
      port: 5432,
    },
    {
      host: `aws-1-${region}.pooler.supabase.com`,
      user: `postgres.${ref}`,
      port: 5432,
    },
  ]),
];

console.log(`Probing ${candidates.length} candidate hosts...`);

for (const cfg of candidates) {
  const c = new pg.Client({
    ...cfg,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 4000,
  });
  try {
    await c.connect();
    const { rows } = await c.query("SELECT current_database() as db");
    console.log(
      `✓ CONNECTED: ${cfg.host}:${cfg.port} as ${cfg.user} (db=${rows[0].db})`,
    );
    await c.end();
    process.exit(0);
  } catch (e) {
    const reason = e.message.split("\n")[0];
    console.log(`✗ ${cfg.host}:${cfg.port} — ${reason}`);
    try {
      await c.end();
    } catch {}
  }
}

console.error("\nNo working host found.");
process.exit(1);
