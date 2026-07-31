import type { Config } from "drizzle-kit";
import { config } from "dotenv";
import { execSync } from "node:child_process";

// Load .env.local (Next.js convention) — `dotenv/config` only reads `.env`.
config({ path: ".env.local" });

/**
 * Drizzle Kit runs on `pg` (see package.json devDeps). Two workarounds baked
 * in here because of local networking bugs on this machine:
 *
 * 1. `pg`'s `family: 4` option is silently ignored (node_modules/pg/lib/
 *    connection.js:44 uses `stream.connect(port, host)` — no options). Node's
 *    happy-eyeballs picks IPv6 first for the Neon pooler and times out at
 *    ~800ms. We resolve an IPv4 A record synchronously via `getent` and pass
 *    it as `host`, with `ssl.servername` preserved so TLS SNI still validates.
 *
 * 2. `sslmode=require` in the URL currently triggers verify-full in the
 *    latest `pg-connection-string`; we set `ssl.rejectUnauthorized:false`
 *    explicitly to match Neon's certificate chain without CA pinning.
 */
const u = new URL(process.env.DATABASE_URL!);
const ipv4Host = execSync(`getent ahostsv4 ${u.hostname}`, { encoding: "utf8" })
  .split("\n")[0]
  .split(/\s+/)[0];

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: ipv4Host,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: false, servername: u.hostname },
  },
  strict: true,
  verbose: true,
} satisfies Config;
