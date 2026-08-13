"use server";

import { updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db/client";
import { skills } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { skillInput } from "@/schemas/skill";
import { zodErr, type ActionState } from "@/lib/action-helpers";

/**
 * Create or update a skill. Slug uniqueness is enforced explicitly so we
 * can return a friendly error before the DB constraint fires.
 */
export async function saveSkill(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;

  // `years` is optional; treat empty string as null.
  const yearsRaw = String(formData.get("years") ?? "").trim();
  const years = yearsRaw === "" ? null : Number(yearsRaw);

  // `displayOrder` defaults to 0 when the field is left blank.
  const displayOrderRaw = String(formData.get("displayOrder") ?? "0").trim();
  const displayOrder = displayOrderRaw === "" ? 0 : Number(displayOrderRaw);

  const parsed = skillInput.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    group: String(formData.get("group") ?? ""),
    proficiency: String(formData.get("proficiency") ?? "proficient"),
    years,
    isPrimary: formData.get("isPrimary") === "on",
    displayOrder,
    iconMediaId: (formData.get("iconMediaId") as string) || null,
    status: (formData.get("status") as "active" | "archived") ?? "active",
  });
  if (!parsed.success) {
    return { error: zodErr(parsed) };
  }

  // Slug uniqueness (skip current row on edit).
  const clash = await db
    .select({ id: skills.id })
    .from(skills)
    .where(
      id
        ? and(eq(skills.slug, parsed.data.slug), ne(skills.id, id))
        : eq(skills.slug, parsed.data.slug),
    )
    .limit(1);
  if (clash.length)
    return { error: (await getTranslations("actions.skills"))("slugTaken") };

  if (id) {
    await db
      .update(skills)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(skills.id, id));
  } else {
    await db.insert(skills).values(parsed.data);
  }

  updateTag(tag.skills());
  return { ok: true };
}

export async function deleteSkill(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };
  await db.delete(skills).where(eq(skills.id, id));
  updateTag(tag.skills());
  return { ok: true };
}

/**
 * Flip a single skill's `isPrimary` flag from the dashboard table.
 * Reuses the `featured` FormData key so the shared FeatureSwitch works.
 */
export async function toggleSkillPrimary(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  const next = formData.get("featured") === "true";
  if (!id) return { error: "Missing id" };

  const [prev] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.id, id));
  if (!prev) return { error: "Not found" };

  await db
    .update(skills)
    .set({ isPrimary: next, updatedAt: new Date() })
    .where(eq(skills.id, id));

  updateTag(tag.skills());
  return { ok: true };
}
