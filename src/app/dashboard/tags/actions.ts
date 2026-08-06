"use server";

import { updateTag } from "next/cache";
import { and, count, eq, ne } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db/client";
import { tags, postsTags } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { tagInput } from "@/schemas/tag";
import type { ActionState } from "@/lib/action-helpers";

export async function saveTag(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;
  const parsed = tagInput.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db
    .select({ id: tags.id })
    .from(tags)
    .where(
      id
        ? and(eq(tags.slug, parsed.data.slug), ne(tags.id, id))
        : eq(tags.slug, parsed.data.slug),
    )
    .limit(1);
  if (existing.length)
    return { error: (await getTranslations("actions.tags"))("slugTaken") };

  if (id) {
    await db
      .update(tags)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(tags.id, id));
  } else {
    await db.insert(tags).values(parsed.data);
  }

  updateTag(tag.tags());
  updateTag(tag.posts()); // post cards render tag chips
  return { ok: true };
}

export async function deleteTag(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const [{ n }] = await db
    .select({ n: count() })
    .from(postsTags)
    .where(eq(postsTags.tagId, id));
  if (n > 0) {
    const t = await getTranslations("actions.tags");
    return { error: t("inUse", { count: n }) };
  }

  await db.delete(tags).where(eq(tags.id, id));
  updateTag(tag.tags());
  return { ok: true };
}
