#!/usr/bin/env node
/**
 * Admin utility: reset a user's password by email.
 * Usage: npm run db:reset-password -- user@example.com newpassword123
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const SALT_ROUNDS = 12;
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function usage() {
  console.error("Usage: npm run db:reset-password -- <email> <new-password>");
  process.exit(1);
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const [email, newPassword] = process.argv.slice(2);
if (!email || !newPassword) usage();

if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to .env.local and retry.");
  process.exit(1);
}

async function main() {
  const sql = postgres(databaseUrl, { max: 1 });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await sql`
      SELECT id, email FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (!user) {
      console.error(`No user found with email: ${normalizedEmail}`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await sql`
      UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user.id}
    `;

    const deleted = await sql`
      DELETE FROM sessions WHERE user_id = ${user.id} RETURNING id
    `;

    console.log(`Password reset for ${user.email}`);
    console.log(`Invalidated ${deleted.length} active session(s).`);
  } catch (error) {
    console.error("Password reset failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

void main();
