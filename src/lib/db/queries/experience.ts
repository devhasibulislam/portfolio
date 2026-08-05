import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { experiences } from "@/lib/db/schema";
import type { ExperienceInput } from "@/schemas/experience";

export type ExperienceRow = {
  id: string;
  company: string;
  companySlug: string;
  role: string;
  slug: string;
  location: string | null;
  workType: ExperienceInput["workType"];
  periodStart: Date;
  periodEnd: Date | null;
  displayOrder: number;
  status: "draft" | "published";
  updatedAt: Date;
};

/**
 * All experience rows for the dashboard list. Ordered by (companySlug,
 * periodStart desc) so promotions at the same company sit together with
 * the most recent role on top.
 */
export async function listExperienceForDashboard(): Promise<ExperienceRow[]> {
  return db
    .select({
      id: experiences.id,
      company: experiences.company,
      companySlug: experiences.companySlug,
      role: experiences.role,
      slug: experiences.slug,
      location: experiences.location,
      workType: experiences.workType,
      periodStart: experiences.periodStart,
      periodEnd: experiences.periodEnd,
      displayOrder: experiences.displayOrder,
      status: experiences.status,
      updatedAt: experiences.updatedAt,
    })
    .from(experiences)
    .orderBy(asc(experiences.companySlug), desc(experiences.periodStart));
}

export type ExperienceFull = {
  id: string;
  company: string;
  companySlug: string;
  role: string;
  slug: string;
  location: string | null;
  workType: ExperienceInput["workType"];
  periodStart: Date;
  periodEnd: Date | null;
  summary: string;
  highlights: unknown;
  companyUrl: string | null;
  companyLogoId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageId: string | null;
  noindex: boolean;
  displayOrder: number;
  status: "draft" | "published";
};

export async function getExperienceForEdit(
  id: string,
): Promise<ExperienceFull | null> {
  const [row] = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, id));
  if (!row) return null;
  return {
    id: row.id,
    company: row.company,
    companySlug: row.companySlug,
    role: row.role,
    slug: row.slug,
    location: row.location,
    workType: row.workType,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    summary: row.summary,
    highlights: row.highlights,
    companyUrl: row.companyUrl,
    companyLogoId: row.companyLogoId,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    ogImageId: row.ogImageId,
    noindex: row.noindex,
    displayOrder: row.displayOrder,
    status: row.status,
  };
}
