import type { Config } from "drizzle-kit";
import "dotenv/config";

/**
 * Drizzle Kit config — reads DATABASE_URL from .env.local at CLI time.
 * Schema will grow phase-by-phase; see src/lib/db/schema.ts.
 */
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
