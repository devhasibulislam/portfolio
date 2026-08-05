"use server";

import { updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { experiences } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { experienceInput } from "@/schemas/experience";

export type ActionState = { error?: string; ok?: true } | null;

const EMPTY_DOC = { type: "doc", content: [] };

/**
 * Bullet-list textarea → TipTap doc. Each non-blank line becomes one list
 * item; blank lines terminate the list. Round-trippable enough for MVP.
 */
function textToBulletDoc(text: string): Record<string, unknown> {
  const t = text.trim();
  if (!t) return EMPTY_DOC;
  const lines = t
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  return {
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: lines.map((line) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: line }],
            },
          ],
        })),
      },
    ],
  };
}

export async function saveExperience(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;

  const periodStartRaw = String(formData.get("periodStart") ?? "").trim();
  const periodEndRaw = String(formData.get("periodEnd") ?? "").trim();
  const toIso = (s: string) =>
    s ? new Date(`${s}T00:00:00.000Z`).toISOString() : null;
  const startIso = toIso(periodStartRaw);
  if (!startIso) return { error: "Start date is required." };

  const highlightsText = String(formData.get("highlightsText") ?? "");

  const workTypeRaw = String(formData.get("workType") ?? "").trim();
  const workType =
    workTypeRaw === "" || workTypeRaw === "none" ? null : workTypeRaw;

  const displayOrderRaw = String(formData.get("displayOrder") ?? "0").trim();

  const parsed = experienceInput.safeParse({
    company: String(formData.get("company") ?? "").trim(),
    companySlug: String(formData.get("companySlug") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim() || null,
    workType,
    periodStart: startIso,
    periodEnd: toIso(periodEndRaw),
    summary: String(formData.get("summary") ?? "").trim(),
    highlights: textToBulletDoc(highlightsText),
    companyUrl: String(formData.get("companyUrl") ?? "").trim() || null,
    companyLogoId: (formData.get("companyLogoId") as string) || null,
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
    metaDescription:
      String(formData.get("metaDescription") ?? "").trim() || null,
    ogImageId: (formData.get("ogImageId") as string) || null,
    noindex: formData.get("noindex") === "on",
    displayOrder: displayOrderRaw === "" ? 0 : Number(displayOrderRaw),
    status: (formData.get("status") as "draft" | "published") ?? "draft",
    tagIds: [],
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Slug uniqueness (skip current row on edit).
  const clash = await db
    .select({ id: experiences.id })
    .from(experiences)
    .where(
      id
        ? and(eq(experiences.slug, parsed.data.slug), ne(experiences.id, id))
        : eq(experiences.slug, parsed.data.slug),
    )
    .limit(1);
  if (clash.length) return { error: "Slug already in use." };

  // MVP: tagIds is parsed for schema compat but not persisted yet — the
  // experience tag picker will land alongside the projects one.
  const { tagIds: _unusedTagIds, ...rest } = parsed.data;
  void _unusedTagIds;

  let publishedAt: Date | null;
  if (rest.status === "published") {
    if (id) {
      const [prev] = await db
        .select({
          status: experiences.status,
          publishedAt: experiences.publishedAt,
        })
        .from(experiences)
        .where(eq(experiences.id, id));
      publishedAt =
        prev && prev.status === "published"
          ? (prev.publishedAt ?? new Date())
          : new Date();
    } else {
      publishedAt = new Date();
    }
  } else {
    publishedAt = null;
  }

  const dbValues = {
    ...rest,
    periodStart: new Date(rest.periodStart),
    periodEnd: rest.periodEnd ? new Date(rest.periodEnd) : null,
    publishedAt,
  };

  let prevSlug: string | null = null;
  if (id) {
    const [prev] = await db
      .select({ slug: experiences.slug })
      .from(experiences)
      .where(eq(experiences.id, id));
    prevSlug = prev?.slug ?? null;
    await db
      .update(experiences)
      .set({ ...dbValues, updatedAt: new Date() })
      .where(eq(experiences.id, id));
  } else {
    await db.insert(experiences).values(dbValues);
  }

  updateTag(tag.experiences());
  updateTag(tag.experience(parsed.data.slug));
  if (prevSlug && prevSlug !== parsed.data.slug) {
    updateTag(tag.experience(prevSlug));
  }
  return { ok: true };
}

export async function deleteExperience(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };
  const [prev] = await db
    .select({ slug: experiences.slug })
    .from(experiences)
    .where(eq(experiences.id, id));
  await db.delete(experiences).where(eq(experiences.id, id));
  updateTag(tag.experiences());
  if (prev) updateTag(tag.experience(prev.slug));
  return { ok: true };
}
