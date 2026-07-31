import { execSync } from "node:child_process";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Neon HTTP driver + Drizzle. Pooled connection required by PROJECT_CONTEXT
 * §13 — the DATABASE_URL host must contain `-pooler`. Never use a direct
 * connection from serverless Next.js code, or you will exhaust Neon's cap.
 *
 * On Vercel we use `@neondatabase/serverless` (HTTP fetch, no persistent
 * socket, per-request). Locally we fall back to `pg` because Node 24's
 * bundled undici has an IPv6-to-Neon fetch bug that manifests as silent
 * ETIMEDOUT — see drizzle.config.ts for the sibling workaround.
 */

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set. See .env.example.");

if (!url.includes("-pooler")) {
  console.warn(
    "[db] DATABASE_URL does not contain '-pooler'. Use the pooled connection " +
      "string in production or you will hit Neon's connection limits.",
  );
}

const useHttp = process.env.VERCEL === "1";

export const db = useHttp
  ? drizzleHttp(neon(url), { schema })
  : (() => {
      const u = new URL(url);
      const ipv4Host = execSync(`getent ahostsv4 ${u.hostname}`, {
        encoding: "utf8",
      })
        .split("\n")[0]!
        .split(/\s+/)[0]!;
      const pool = new Pool({
        host: ipv4Host,
        port: Number(u.port || 5432),
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.slice(1),
        ssl: { rejectUnauthorized: false, servername: u.hostname },
        max: 4,
      });
      return drizzleNode(pool, { schema });
    })();

export type Db = typeof db;
