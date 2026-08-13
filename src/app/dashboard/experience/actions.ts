"use server";

import { updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db/client";
import { experiences } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { experienceInput } from "@/schemas/experience";
import { wouldExceedFeaturedLimit } from "@/lib/db/feature-limit";
import {
  parseTiptapDoc,
  toIso,
  zodErr,
  type ActionState,
} from "@/lib/action-helpers";

export async function saveExperience(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations("actions.experience");
  const id = String(formData.get("id") ?? "").trim() || null;

  const periodStartRaw = String(formData.get("periodStart") ?? "").trim();
  const periodEndRaw = String(formData.get("periodEnd") ?? "").trim();
  const startIso = toIso(periodStartRaw);
  if (!startIso) return { error: t("startRequired") };

  const highlightsRaw = String(formData.get("highlights") ?? "");

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
    highlights: parseTiptapDoc(highlightsRaw),
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
    return { error: zodErr(parsed) };
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
  if (clash.length) return { error: t("slugTaken") };

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

/**
 * Flip a single experience row's `featured` flag. Cap is 4 (home shows 4).
 */
export async function toggleExperienceFeatured(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations("actions.experience");
  const id = String(formData.get("id") ?? "").trim();
  const next = formData.get("featured") === "true";
  if (!id) return { error: "Missing id" };

  const [prev] = await db
    .select({ slug: experiences.slug })
    .from(experiences)
    .where(eq(experiences.id, id));
  if (!prev) return { error: "Not found" };

  if (next && (await wouldExceedFeaturedLimit("experiences", id))) {
    return { error: t("featureLimitReached") };
  }

  await db
    .update(experiences)
    .set({ featured: next, updatedAt: new Date() })
    .where(eq(experiences.id, id));

  updateTag(tag.experiences());
  updateTag(tag.experience(prev.slug));
  return { ok: true };
}
