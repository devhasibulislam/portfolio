import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, posts } from "@/lib/db/schema";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

/** All categories with post count. Ordered by name. */
export async function listCategoriesWithCount(): Promise<CategoryRow[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      postCount:
        sql<number>`(SELECT count(*)::int FROM ${posts} WHERE ${posts.categoryId} = ${categories.id})`.as(
          "post_count",
        ),
    })
    .from(categories)
    .orderBy(categories.name);
  return rows;
}
