import { count as sqlCount } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/lib/db/client";
import { categories, media, posts, resumes, tags } from "@/lib/db/schema";

export type OverviewCounts = {
  posts: number;
  categories: number;
  tags: number;
  media: number;
  resume: number;
};

/**
 * Single round-trip Promise.all — one COUNT per table, all issued in parallel.
 * Used by the dashboard overview to render the count badge on each card.
 */
export async function getOverviewCounts(): Promise<OverviewCounts> {
  const one = async (table: PgTable): Promise<number> => {
    const rows = await db.select({ n: sqlCount() }).from(table);
    return rows[0]!.n;
  };

  const [p, c, t, m, r] = await Promise.all([
    one(posts),
    one(categories),
    one(tags),
    one(media),
    one(resumes),
  ]);
  return { posts: p, categories: c, tags: t, media: m, resume: r };
}
