import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { tags, postsTags } from "@/lib/db/schema";
import type { SlugRow } from "@/components/dashboard/slug-entity-table";

/** All tags with post count via posts_tags. Ordered by name. */
export async function listTagsWithCount(): Promise<SlugRow[]> {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      postCount:
        sql<number>`(SELECT count(*)::int FROM ${postsTags} WHERE ${postsTags.tagId} = ${tags.id})`.as(
          "post_count",
        ),
    })
    .from(tags)
    .orderBy(tags.name);
}
