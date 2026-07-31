"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts, postsTags } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { postInput } from "@/schemas/post";

export type ActionState = { error?: string; ok?: true } | null;

/**
 * Create or update a post. On success, redirects to the edit page (so the
 * client stops seeing the "new" URL). Tag join rows are rewritten atomically
 * via delete + insert — small N (max 8 per §5), no reason for a merge.
 */
export async function savePost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;

  let body: unknown = {};
  try {
    body = JSON.parse(String(formData.get("body") ?? "{}"));
  } catch {
    return { error: "Body is not valid JSON." };
  }

  const rawTagIds = formData.getAll("tagIds").map(String).filter(Boolean);
  const parsed = postInput.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    metaDescription: String(formData.get("metaDescription") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    body,
    coverMediaId: (formData.get("coverMediaId") as string) || null,
    categoryId: (formData.get("categoryId") as string) || null,
    tagIds: rawTagIds,
    status: (formData.get("status") as "draft" | "published") ?? "draft",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Slug uniqueness (skip current row on edit).
  const clash = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      id
        ? and(eq(posts.slug, parsed.data.slug), ne(posts.id, id))
        : eq(posts.slug, parsed.data.slug),
    )
    .limit(1);
  if (clash.length) return { error: "Slug already in use." };

  const { tagIds, ...rest } = parsed.data;

  // Set publishedAt exactly once — the first time status flips to 'published'.
  let publishedAt: Date | null | undefined = undefined;
  if (rest.status === "published") {
    if (id) {
      const [prev] = await db
        .select({
          status: posts.status,
          publishedAt: posts.publishedAt,
        })
        .from(posts)
        .where(eq(posts.id, id));
      if (prev && prev.status !== "published") publishedAt = new Date();
      else publishedAt = prev?.publishedAt ?? new Date();
    } else {
      publishedAt = new Date();
    }
  } else if (rest.status === "draft") {
    // Un-publishing clears the timestamp — we treat it as never published.
    publishedAt = null;
  }

  let savedId: string;
  if (id) {
    await db
      .update(posts)
      .set({ ...rest, publishedAt, updatedAt: new Date() })
      .where(eq(posts.id, id));
    savedId = id;
    await db.delete(postsTags).where(eq(postsTags.postId, id));
  } else {
    const [row] = await db
      .insert(posts)
      .values({ ...rest, publishedAt })
      .returning();
    savedId = row.id;
  }

  if (tagIds.length) {
    await db
      .insert(postsTags)
      .values(tagIds.map((tagId) => ({ postId: savedId, tagId })));
  }

  updateTag(tag.posts());
  updateTag(tag.post(parsed.data.slug));

  redirect(`/dashboard/posts/${savedId}/edit?saved=1`);
}

export async function deletePost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };
  await db.delete(posts).where(eq(posts.id, id));
  updateTag(tag.posts());
  return { ok: true };
}

/**
 * Flip a single post between draft and published. Sets `publishedAt` on the
 * first draft → published transition and clears it when going back to draft.
 * Used by the posts-list row Switch — no full form save.
 */
export async function togglePostStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  const status = formData.get("status") as "draft" | "published" | null;
  if (!id || (status !== "draft" && status !== "published")) {
    return { error: "Missing id or status" };
  }

  const [prev] = await db
    .select({
      slug: posts.slug,
      status: posts.status,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(eq(posts.id, id));
  if (!prev) return { error: "Not found" };

  let publishedAt: Date | null;
  if (status === "published") {
    publishedAt =
      prev.status === "published"
        ? (prev.publishedAt ?? new Date())
        : new Date();
  } else {
    publishedAt = null;
  }

  await db
    .update(posts)
    .set({ status, publishedAt, updatedAt: new Date() })
    .where(eq(posts.id, id));

  updateTag(tag.posts());
  updateTag(tag.post(prev.slug));
  return { ok: true };
}
