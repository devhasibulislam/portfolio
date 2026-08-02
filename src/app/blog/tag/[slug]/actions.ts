"use server";

import {
  listPublishedPostsCursor,
  type PostsPage,
} from "@/lib/db/queries/public-posts";

export async function loadMoreTagPosts(
  tagSlug: string,
  cursor: string,
): Promise<PostsPage> {
  return listPublishedPostsCursor({ cursor, limit: 12, tagSlug });
}
