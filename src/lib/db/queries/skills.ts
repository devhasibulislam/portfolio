import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { media, skills } from "@/lib/db/schema";
import type { SkillInput } from "@/schemas/skill";

export type SkillRow = {
  id: string;
  name: string;
  slug: string;
  group: SkillInput["group"];
  proficiency: SkillInput["proficiency"];
  years: number | null;
  isPrimary: boolean;
  displayOrder: number;
  status: "active" | "archived";
  iconMediaId: string | null;
  updatedAt: Date;
};

/**
 * All skills, ordered by (group, displayOrder, name) — the same shape the
 * public /skills page uses, so the dashboard preview matches what visitors
 * see. Dashboard renders every row (including archived).
 */
export async function listSkillsForDashboard(): Promise<SkillRow[]> {
  return db
    .select({
      id: skills.id,
      name: skills.name,
      slug: skills.slug,
      group: skills.group,
      proficiency: skills.proficiency,
      years: skills.years,
      isPrimary: skills.isPrimary,
      displayOrder: skills.displayOrder,
      status: skills.status,
      iconMediaId: skills.iconMediaId,
      updatedAt: skills.updatedAt,
    })
    .from(skills)
    .orderBy(asc(skills.group), asc(skills.displayOrder), asc(skills.name));
}

export async function getSkillById(id: string): Promise<SkillRow | null> {
  const [row] = await db
    .select({
      id: skills.id,
      name: skills.name,
      slug: skills.slug,
      group: skills.group,
      proficiency: skills.proficiency,
      years: skills.years,
      isPrimary: skills.isPrimary,
      displayOrder: skills.displayOrder,
      status: skills.status,
      iconMediaId: skills.iconMediaId,
      updatedAt: skills.updatedAt,
    })
    .from(skills)
    .where(eq(skills.id, id));
  return row ?? null;
}

/**
 * Public projection: active rows only, grouped by category. Consumed by the
 * `/skills` page (and later the terminal hero's `skills` command).
 */
export type PublicSkill = {
  id: string;
  name: string;
  proficiency: SkillInput["proficiency"];
  years: number | null;
  isPrimary: boolean;
  iconUrl: string | null;
};

export type PublicSkillGroup = {
  group: SkillInput["group"];
  items: PublicSkill[];
};

export async function listPublicSkillsGrouped(): Promise<PublicSkillGroup[]> {
  const rows = await db
    .select({
      id: skills.id,
      name: skills.name,
      group: skills.group,
      proficiency: skills.proficiency,
      years: skills.years,
      isPrimary: skills.isPrimary,
      displayOrder: skills.displayOrder,
      iconUrl: media.url,
    })
    .from(skills)
    .leftJoin(media, eq(skills.iconMediaId, media.id))
    .where(eq(skills.status, "active"))
    .orderBy(asc(skills.group), asc(skills.displayOrder), asc(skills.name));

  const map = new Map<SkillInput["group"], PublicSkill[]>();
  for (const r of rows) {
    const bucket = map.get(r.group) ?? [];
    bucket.push({
      id: r.id,
      name: r.name,
      proficiency: r.proficiency,
      years: r.years,
      isPrimary: r.isPrimary,
      iconUrl: r.iconUrl,
    });
    map.set(r.group, bucket);
  }
  return Array.from(map, ([group, items]) => ({ group, items }));
}
