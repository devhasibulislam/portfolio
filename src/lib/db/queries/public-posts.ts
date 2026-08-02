import "server-only";
import { and, desc, eq, inArray, isNotNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, media, posts, postsTags, tags } from "@/lib/db/schema";

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
  tagSlug?: string;
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
  if (input.tagSlug) {
    conds.push(eq(tags.slug, input.tagSlug));
  }

  const base = db
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
    .leftJoin(media, eq(media.id, posts.coverMediaId));

  // Only join the M2M table when actually filtering by tag — keeps the
  // hot /blog and category paths from paying for a join they don't use.
  const query = input.tagSlug
    ? base
        .innerJoin(postsTags, eq(postsTags.postId, posts.id))
        .innerJoin(tags, eq(tags.id, postsTags.tagId))
    : base;

  const rows = await query
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

export type PublicPostDetail = {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  excerpt: string;
  body: unknown; // Tiptap JSON
  publishedAt: string;
  updatedAt: string;
  categoryName: string | null;
  categorySlug: string | null;
  coverPublicId: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  tags: { name: string; slug: string }[];
};

/**
 * A single published post by slug for `/blog/[slug]`. Returns null if the
 * slug is unknown or the post is a draft — the page maps that to 404.
 */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublicPostDetail | null> {
  const [row] = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      metaDescription: posts.metaDescription,
      excerpt: posts.excerpt,
      body: posts.body,
      publishedAt: sql<Date>`${posts.publishedAt}`.as("published_at"),
      updatedAt: posts.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      coverPublicId: media.publicId,
      coverWidth: media.width,
      coverHeight: media.height,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.coverMediaId))
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.status, "published"),
        isNotNull(posts.publishedAt),
      ),
    );
  if (!row) return null;

  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(postsTags)
    .innerJoin(tags, eq(tags.id, postsTags.tagId))
    .where(inArray(postsTags.postId, [row.id]))
    .orderBy(tags.name);

  return {
    ...row,
    publishedAt: new Date(
      row.publishedAt as unknown as string | Date,
    ).toISOString(),
    updatedAt: new Date(
      row.updatedAt as unknown as string | Date,
    ).toISOString(),
    tags: tagRows,
  };
}

/** Category name for the `/blog/category/[slug]` header + metadata. */
export async function getCategoryBySlug(slug: string) {
  const [row] = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.slug, slug));
  return row ?? null;
}

/** Tag name for the `/blog/tag/[slug]` header + metadata. */
export async function getTagBySlug(slug: string) {
  const [row] = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(tags)
    .where(eq(tags.slug, slug));
  return row ?? null;
}
