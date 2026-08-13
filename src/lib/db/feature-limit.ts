import "server-only";
import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { experiences, posts, projects, receipts } from "@/lib/db/schema";

const CONFIG = {
  projects: { table: projects, max: 3 },
  posts: { table: posts, max: 3 },
  receipts: { table: receipts, max: 3 },
  experiences: { table: experiences, max: 4 },
} as const;

export type FeaturedKind = keyof typeof CONFIG;

export const featuredLimit = (kind: FeaturedKind) => CONFIG[kind].max;

/**
 * Returns true if flipping this row to `featured=true` would exceed the cap.
 * `excludeId` skips the row being edited so a save that keeps featured=true
 * doesn't count itself.
 */
export async function wouldExceedFeaturedLimit(
  kind: FeaturedKind,
  excludeId: string | null,
): Promise<boolean> {
  const { table, max } = CONFIG[kind];
  const conds = [eq(table.featured, true)];
  if (excludeId) conds.push(ne(table.id, excludeId));
  const [row] = await db
    .select({ n: count() })
    .from(table)
    .where(and(...conds));
  return (row?.n ?? 0) >= max;
}

