"use server";

import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { links } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { linkInput } from "@/schemas/link";

export type ActionState = { error?: string; ok?: true } | null;

export async function saveLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;
  const parsed = linkInput.safeParse({
    label: String(formData.get("label") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (id) {
    await db
      .update(links)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(links.id, id));
  } else {
    await db.insert(links).values(parsed.data);
  }

  updateTag(tag.links());
  return { ok: true };
}

export async function deleteLink(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };
  await db.delete(links).where(eq(links.id, id));
  updateTag(tag.links());
  return { ok: true };
}
