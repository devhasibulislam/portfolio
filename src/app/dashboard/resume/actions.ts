"use server";

import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { resumes } from "@/lib/db/schema";
import { cloudinary } from "@/lib/cloudinary";
import { tag } from "@/lib/cache-tags";
import { resumeInput } from "@/schemas/resume";

import { zodErr, type ActionState } from "@/lib/action-helpers";

/** Register a resume after Cloudinary upload. First one uploaded is auto-active. */
export async function registerResume(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resumeInput.safeParse({
    publicId: String(formData.get("publicId") ?? ""),
    url: String(formData.get("url") ?? ""),
    originalName: String(formData.get("originalName") ?? "").slice(0, 255),
    bytes: Number(formData.get("bytes") ?? 0),
  });
  if (!parsed.success) {
    return { error: zodErr(parsed) };
  }

  const existing = await db.select({ id: resumes.id }).from(resumes).limit(1);
  await db
    .insert(resumes)
    .values({ ...parsed.data, isActive: existing.length === 0 })
    .onConflictDoNothing({ target: resumes.publicId });

  updateTag(tag.resumes());
  if (existing.length === 0) updateTag(tag.activeResume());
  return { ok: true };
}

/** Set exactly one resume active. Two writes; partial-unique index guards races. */
export async function setActiveResume(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  await db
    .update(resumes)
    .set({ isActive: false })
    .where(eq(resumes.isActive, true));
  await db.update(resumes).set({ isActive: true }).where(eq(resumes.id, id));

  updateTag(tag.resumes());
  updateTag(tag.activeResume());
  return { ok: true };
}

/**
 * Delete a resume — always allowed, even the currently-active one. Cloudinary
 * asset is destroyed too (invalidate:true kills the CDN cache). If the deleted
 * row was active, no fallback is auto-picked — the owner picks the next
 * active one manually.
 */
export async function deleteResume(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };

  const [row] = await db.select().from(resumes).where(eq(resumes.id, id));
  if (!row) return { error: "Not found" };

  try {
    await cloudinary.uploader.destroy(row.publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  } catch (e) {
    console.error("[resume.delete] cloudinary destroy failed", e);
  }

  await db.delete(resumes).where(eq(resumes.id, id));
  updateTag(tag.resumes());
  if (row.isActive) updateTag(tag.activeResume());
  return { ok: true };
}
