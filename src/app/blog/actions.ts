"use server";

import {
  listPublishedPostsCursor,
  type PostsPage,
} from "@/lib/db/queries/public-posts";

/**
 * Server action for `useCursor` on /blog. Kept single-arg so extending the
 * hook to /blog/category/[slug] later is one wrapper action, not a signature
 * change. No `"use cache"` — this is on-demand and small.
 */
export async function loadMoreBlogPosts(cursor: string): Promise<PostsPage> {
  return listPublishedPostsCursor({ cursor, limit: 12 });
}
