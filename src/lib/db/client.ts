import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon HTTP driver + Drizzle. Pooled connection required by PROJECT_CONTEXT §13
 * — the DATABASE_URL host must contain `-pooler`. Never use a direct connection
 * from serverless Next.js code, or you will exhaust Neon's connection cap.
 *
 * `neon()` is a thin HTTP client (no persistent socket), so it is safe to
 * instantiate per module. Drizzle wraps it for type-safe queries.
 */
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. See .env.example.");
}

if (!process.env.DATABASE_URL.includes("-pooler")) {
  // Loud warning, not throw — allow non-pooled during local pgboss / offline dev
  // if the developer explicitly overrides.
  console.warn(
    "[db] DATABASE_URL does not contain '-pooler'. Use the pooled connection " +
      "string in production or you will hit Neon's connection limits."
  );
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export type Db = typeof db;
