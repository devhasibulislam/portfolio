import "server-only";
import { and, desc, eq, isNotNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, media, posts } from "@/lib/db/schema";

export type PublicPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  // ISO 8601 string. Kept as a string (not Date) so the shape is identical
  // whether it comes from an RSC render or a server-action JSON response —
  // server actions serialize Date to string, RSC doesn't.
  publishedAt: string;
  categoryName: string | null;
  categorySlug: string | null;
  coverPublicId: string | null;
};

/**
 * Composite cursor `(publishedAt, id)`. Stable when two posts share a
 * publishedAt second — id is the tiebreaker. Serialized as base64 JSON so
 * the client can hand it straight back without parsing.
 */
export type PostCursor = { p: string; id: string };

export function encodeCursor(c: PostCursor | null): string | null {
  if (!c) return null;
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

export function decodeCursor(s: string | null): PostCursor | null {
  if (!s) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(s, "base64url").toString("utf8"),
    ) as PostCursor;
    if (typeof parsed.p !== "string" || typeof parsed.id !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export type PostsPage = {
  items: PublicPostCard[];
  nextCursor: string | null;
};

/**
 * Published posts, newest first, cursor-paginated. `filter` is optional so
 * the same query serves /blog, /blog/category/[slug], /blog/tag/[slug]
 * (§14 — one impl, three consumers). Peek at limit+1 to know if there's
 * another page without a separate COUNT.
 */
export async function listPublishedPostsCursor(input: {
  cursor?: string | null;
  limit?: number;
  categorySlug?: string;
  // ponytail: tagSlug branch lives here later — needs postsTags join.
}): Promise<PostsPage> {
  const limit = Math.min(Math.max(input.limit ?? 12, 1), 24);
  const cur = decodeCursor(input.cursor ?? null);

  const conds = [eq(posts.status, "published"), isNotNull(posts.publishedAt)];
  if (cur) {
    conds.push(
      or(
        lt(posts.publishedAt, new Date(cur.p)),
        and(eq(posts.publishedAt, new Date(cur.p)), lt(posts.id, cur.id)),
      )!,
    );
  }
  if (input.categorySlug) {
    conds.push(eq(categories.slug, input.categorySlug));
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      publishedAt: sql<Date>`${posts.publishedAt}`.as("published_at"),
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverPublicId: media.publicId,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverMediaId))
    .where(and(...conds))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items: PublicPostCard[] = rows.slice(0, limit).map((r) => ({
    ...r,
    // Drizzle over neon-http can return a Date OR a raw string depending on
    // the driver version — normalize via `new Date()` either way.
    publishedAt: new Date(
      r.publishedAt as unknown as string | Date,
    ).toISOString(),
  }));
  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last ? encodeCursor({ p: last.publishedAt, id: last.id }) : null;

  return { items, nextCursor };
}
