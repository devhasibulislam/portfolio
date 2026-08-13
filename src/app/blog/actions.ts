"use server";

import {
  listPublishedPostsCursor,
  type PostsPage,
} from "@/lib/db/queries/public-posts";
import { PAGE_NEXT } from "@/lib/pagination";

type Filter = { categorySlug?: string; tagSlug?: string };

/**
 * Single cursor loader for /blog, /blog/category/[slug], and /blog/tag/[slug].
 * Pages pass an empty filter or `.bind(null, { categorySlug })` / `.bind(null, { tagSlug })`.
 */
export async function loadMorePublishedPosts(
  filter: Filter,
  cursor: string,
): Promise<PostsPage> {
  return listPublishedPostsCursor({ cursor, limit: PAGE_NEXT, ...filter });
}
