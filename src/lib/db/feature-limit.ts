import "server-only";
import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts, projects, receipts } from "@/lib/db/schema";

export const MAX_FEATURED = 3;

const TABLES = { projects, posts, receipts } as const;
export type FeaturedKind = keyof typeof TABLES;

/**
 * Returns true if flipping this row to `featured=true` would exceed the cap.
 * `excludeId` skips the row being edited so a save that keeps featured=true
 * doesn't count itself.
 */
export async function wouldExceedFeaturedLimit(
  kind: FeaturedKind,
  excludeId: string | null,
): Promise<boolean> {
  const t = TABLES[kind];
  const conds = [eq(t.featured, true)];
  if (excludeId) conds.push(ne(t.id, excludeId));
  const [row] = await db
    .select({ n: count() })
    .from(t)
    .where(and(...conds));
  return (row?.n ?? 0) >= MAX_FEATURED;
}
