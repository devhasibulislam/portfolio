"use server";

import { updateTag } from "next/cache";
import { and, count, eq, ne } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db/client";
import { categories, posts } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { categoryInput } from "@/schemas/category";

export type ActionState = { error?: string; ok?: true } | null;

/** Create or update a category (single action, id absent = create). */
export async function saveCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;
  const parsed = categoryInput.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Slug uniqueness (skip current row on edit).
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      id
        ? and(eq(categories.slug, parsed.data.slug), ne(categories.id, id))
        : eq(categories.slug, parsed.data.slug),
    )
    .limit(1);
  if (existing.length)
    return {
      error: (await getTranslations("actions.categories"))("slugTaken"),
    };

  if (id) {
    await db
      .update(categories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(categories.id, id));
  } else {
    await db.insert(categories).values(parsed.data);
  }

  updateTag(tag.categories());
  updateTag(tag.posts()); // post cards render category name
  return { ok: true };
}

/** Delete a category. Blocked if any post still uses it (runtime guard). */
export async function deleteCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const [{ n }] = await db
    .select({ n: count() })
    .from(posts)
    .where(eq(posts.categoryId, id));
  if (n > 0) {
    const t = await getTranslations("actions.categories");
    return { error: t("inUse", { count: n }) };
  }

  await db.delete(categories).where(eq(categories.id, id));
  updateTag(tag.categories());
  return { ok: true };
}
