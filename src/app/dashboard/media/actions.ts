"use server";

import { updateTag } from "next/cache";
import { count, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db/client";
import { media, posts } from "@/lib/db/schema";
import { cloudinary } from "@/lib/cloudinary";
import { tag } from "@/lib/cache-tags";
import { mediaInput } from "@/schemas/media";

type ActionState = { error?: string; ok?: true; id?: string } | null;

/**
 * Called by the client immediately after a successful signed upload. Inserts
 * a row into `media` so the asset shows up in the reuse picker, and returns
 * the DB `id` so the caller can persist it as a FK (e.g. `posts.cover_media_id`).
 * The public_id unique index protects against duplicate registrations —
 * on conflict we return the existing row's id.
 */
export async function registerMedia(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = mediaInput.safeParse({
    publicId: String(formData.get("publicId") ?? ""),
    url: String(formData.get("url") ?? ""),
    originalName: String(formData.get("originalName") ?? "").slice(0, 255),
    width: Number(formData.get("width") ?? 0),
    height: Number(formData.get("height") ?? 0),
    bytes: Number(formData.get("bytes") ?? 0),
    format: String(formData.get("format") ?? ""),
    folder: String(formData.get("folder") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [inserted] = await db
    .insert(media)
    .values(parsed.data)
    .onConflictDoNothing({ target: media.publicId })
    .returning();

  // onConflictDoNothing returns [] when a row already existed for this
  // publicId (duplicate registration). Look the id up so the client can
  // still get a usable FK.
  const id =
    inserted?.id ??
    (
      await db
        .select({ id: media.id })
        .from(media)
        .where(eq(media.publicId, parsed.data.publicId))
        .limit(1)
    )[0]?.id;

  updateTag(tag.media());
  return { ok: true, id };
}

/**
 * Delete an asset. Blocked at runtime if any post still references it as a
 * cover. Removes the Cloudinary asset first, then the DB row.
 */
export async function deleteMedia(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return { error: "Not found" };

  const [{ n }] = await db
    .select({ n: count() })
    .from(posts)
    .where(eq(posts.coverMediaId, id));
  if (n > 0) {
    const t = await getTranslations("actions.media");
    return { error: t("inUse", { count: n }) };
  }

  try {
    await cloudinary.uploader.destroy(row.publicId, { invalidate: true });
  } catch (e) {
    // If Cloudinary fails we still want the DB row gone (idempotent — user
    // can re-run). Log and continue.
    console.error("[media.delete] cloudinary destroy failed", e);
  }

  await db.delete(media).where(eq(media.id, id));
  updateTag(tag.media());
  return { ok: true };
}
