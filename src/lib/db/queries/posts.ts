import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, media, posts, postsTags, tags } from "@/lib/db/schema";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  updatedAt: Date;
  categoryName: string | null;
  featured: boolean;
};

/** All posts, newest updated first, with category name flattened. */
export async function listPosts(): Promise<PostRow[]> {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      categoryName: categories.name,
      featured: posts.featured,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .orderBy(desc(posts.updatedAt));
}

export type PostFull = {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  excerpt: string;
  body: unknown;
  coverMediaId: string | null;
  categoryId: string | null;
  status: "draft" | "published";
  featured: boolean;
  tagIds: string[];
};

/** Full post for the edit form — includes body JSON and joined tag ids. */
export async function getPostForEdit(id: string): Promise<PostFull | null> {
  const [row] = await db.select().from(posts).where(eq(posts.id, id));
  if (!row) return null;
  const tagRows = await db
    .select({ tagId: postsTags.tagId })
    .from(postsTags)
    .where(eq(postsTags.postId, id));
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    metaDescription: row.metaDescription,
    excerpt: row.excerpt,
    body: row.body,
    coverMediaId: row.coverMediaId,
    categoryId: row.categoryId,
    status: row.status,
    featured: row.featured,
    tagIds: tagRows.map((t) => t.tagId),
  };
}

/** Compact media list for the cover picker (id, publicId, name). */
export async function listMediaForPicker() {
  return db
    .select({
      id: media.id,
      publicId: media.publicId,
      originalName: media.originalName,
    })
    .from(media)
    .where(eq(media.folder, "portfolio/posts"))
    .orderBy(desc(media.createdAt));
}

/** Sorted (id,name) list for category/tag pickers. */
export async function listCategoriesForPicker() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.name);
}

export async function listTagsForPicker() {
  return db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .orderBy(tags.name);
}
