import { count, eq } from "drizzle-orm";
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
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      postCount: count(posts.id).as("post_count"),
    })
    .from(categories)
    .leftJoin(posts, eq(posts.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.name);
}
