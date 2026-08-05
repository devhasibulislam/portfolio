import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { experiences, media } from "@/lib/db/schema";
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

// ---------- public projections ------------------------------------------

export type PublicExperienceCard = {
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
  companyUrl: string | null;
  logoPublicId: string | null;
};

/**
 * Published experience rows for the public `/experience` timeline.
 * Current roles (periodEnd IS NULL) surface first, then reverse-chronological
 * by periodStart — same order the render layer needs to group by company.
 */
export async function listPublishedExperience(): Promise<
  PublicExperienceCard[]
> {
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
      summary: experiences.summary,
      companyUrl: experiences.companyUrl,
      logoPublicId: media.publicId,
    })
    .from(experiences)
    .leftJoin(media, eq(media.id, experiences.companyLogoId))
    .where(
      and(eq(experiences.status, "published"), eq(experiences.noindex, false)),
    )
    .orderBy(
      // Postgres `NULLS FIRST` for the ongoing-role sort: rows where end
      // is NULL come out on top.
      sql`${experiences.periodEnd} DESC NULLS FIRST`,
      desc(experiences.periodStart),
      asc(experiences.companySlug),
    );
}

export type PublicExperience = {
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
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date;
  updatedAt: Date;
  logoPublicId: string | null;
  logoWidth: number | null;
  logoHeight: number | null;
  ogPublicId: string | null;
};

/**
 * Full public role by slug. Returns null for drafts / noindex / missing,
 * so the detail route can call `notFound()` directly.
 */
export async function getPublishedExperienceBySlug(
  slug: string,
): Promise<PublicExperience | null> {
  const [row] = await db
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
      summary: experiences.summary,
      highlights: experiences.highlights,
      companyUrl: experiences.companyUrl,
      metaTitle: experiences.metaTitle,
      metaDescription: experiences.metaDescription,
      publishedAt: experiences.publishedAt,
      updatedAt: experiences.updatedAt,
      logoPublicId: media.publicId,
      logoWidth: media.width,
      logoHeight: media.height,
      ogImageId: experiences.ogImageId,
      status: experiences.status,
      noindex: experiences.noindex,
    })
    .from(experiences)
    .leftJoin(media, eq(media.id, experiences.companyLogoId))
    .where(eq(experiences.slug, slug));
  if (!row || row.status !== "published" || row.noindex) return null;

  // OG image override lookup — only when set. Same pattern as projects.
  let ogPublicId: string | null = null;
  if (row.ogImageId) {
    const [ogRow] = await db
      .select({ publicId: media.publicId })
      .from(media)
      .where(eq(media.id, row.ogImageId));
    ogPublicId = ogRow?.publicId ?? null;
  }

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
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    publishedAt: row.publishedAt as Date,
    updatedAt: row.updatedAt,
    logoPublicId: row.logoPublicId,
    logoWidth: row.logoWidth,
    logoHeight: row.logoHeight,
    ogPublicId,
  };
}
