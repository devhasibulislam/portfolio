import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { media, projectLinks, projects } from "@/lib/db/schema";
import type { ProjectInput, ProjectLinkInput } from "@/schemas/project";

export type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  client: string | null;
  category: ProjectInput["category"];
  featured: boolean;
  displayOrder: number;
  status: "draft" | "published";
  publishedAt: Date | null;
  updatedAt: Date;
};

/**
 * All projects for the dashboard list — newest updated first, with the
 * publish + featured metadata the table row needs.
 */
export async function listProjectsForDashboard(): Promise<ProjectRow[]> {
  return db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      tagline: projects.tagline,
      client: projects.client,
      category: projects.category,
      featured: projects.featured,
      displayOrder: projects.displayOrder,
      status: projects.status,
      publishedAt: projects.publishedAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .orderBy(desc(projects.updatedAt));
}

export type ProjectFull = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  client: string | null;
  location: string | null;
  role: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  body: unknown;
  outcome: string | null;
  category: ProjectInput["category"];
  coverMediaId: string | null;
  ogImageId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  noindex: boolean;
  featured: boolean;
  displayOrder: number;
  status: "draft" | "published";
  links: ProjectLinkInput[];
};

/**
 * Full project for the edit dialog — scalar columns plus ordered links.
 * Links are loaded in a second query so the row shape stays flat.
 */
export async function getProjectForEdit(
  id: string,
): Promise<ProjectFull | null> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  if (!row) return null;
  const linkRows = await db
    .select({
      kind: projectLinks.kind,
      label: projectLinks.label,
      url: projectLinks.url,
    })
    .from(projectLinks)
    .where(eq(projectLinks.projectId, id))
    .orderBy(asc(projectLinks.sortOrder));
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    tagline: row.tagline,
    client: row.client,
    location: row.location,
    role: row.role,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    body: row.body,
    outcome: row.outcome,
    category: row.category,
    coverMediaId: row.coverMediaId,
    ogImageId: row.ogImageId,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    noindex: row.noindex,
    featured: row.featured,
    displayOrder: row.displayOrder,
    status: row.status,
    links: linkRows,
  };
}

// ---------- public projections ------------------------------------------

export type PublicProjectCard = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  client: string | null;
  category: ProjectInput["category"];
  featured: boolean;
  publishedAt: Date;
  coverPublicId: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
};

/**
 * Published projects for the public `/projects` grid. Featured first,
 * then by displayOrder, then newest published. Cover media flattened so
 * the card component can Cloudinary-render without a second round-trip.
 */
export async function listPublishedProjects(): Promise<PublicProjectCard[]> {
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      tagline: projects.tagline,
      client: projects.client,
      category: projects.category,
      featured: projects.featured,
      displayOrder: projects.displayOrder,
      publishedAt: projects.publishedAt,
      coverPublicId: media.publicId,
      coverWidth: media.width,
      coverHeight: media.height,
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.coverMediaId))
    .where(and(eq(projects.status, "published"), eq(projects.noindex, false)))
    .orderBy(
      desc(projects.featured),
      asc(projects.displayOrder),
      desc(projects.publishedAt),
    );
  return rows.map((r) => ({
    ...r,
    // status='published' guarantees publishedAt is set, but the column is
    // nullable — narrow it here so consumers don't have to.
    publishedAt: r.publishedAt as Date,
  }));
}

/**
 * Cursor tuple over `(displayOrder ASC, id ASC)`. Featured is not part of
 * the cursor: it only decides the primary sort branch, and every project
 * with `featured=true` lands ahead of every unfeatured one. That means
 * within a given branch we can page by (displayOrder, id) safely.
 */
export type ProjectCursor = { f: 0 | 1; o: number; id: string };

export function encodeProjectCursor(c: ProjectCursor | null): string | null {
  if (!c) return null;
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

export function decodeProjectCursor(s: string | null): ProjectCursor | null {
  if (!s) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(s, "base64url").toString("utf8"),
    ) as ProjectCursor;
    if (
      (parsed.f !== 0 && parsed.f !== 1) ||
      typeof parsed.o !== "number" ||
      typeof parsed.id !== "string"
    )
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export type ProjectsPage = {
  items: PublicProjectCard[];
  nextCursor: string | null;
};

export async function listPublishedProjectsCursor(input: {
  cursor?: string | null;
  limit?: number;
}): Promise<ProjectsPage> {
  const limit = Math.min(Math.max(input.limit ?? 6, 1), 24);
  const cur = decodeProjectCursor(input.cursor ?? null);

  const conds = [eq(projects.status, "published"), eq(projects.noindex, false)];
  if (cur) {
    // Featured group is denser than unfeatured group. Compare the tuple
    // (featured DESC, displayOrder ASC, id ASC) against the cursor:
    //   next row is either
    //     - same feature bucket AND (order,id) > (cur.o, cur.id), OR
    //     - later feature bucket (only unfeatured after featured).
    const sameFeat = eq(projects.featured, cur.f === 1);
    const laterFeat = eq(projects.featured, false);
    conds.push(
      or(
        and(
          sameFeat,
          or(
            sql`${projects.displayOrder} > ${cur.o}`,
            and(
              sql`${projects.displayOrder} = ${cur.o}`,
              sql`${projects.id} > ${cur.id}`,
            ),
          )!,
        )!,
        cur.f === 1 ? laterFeat : sql`false`,
      )!,
    );
  }

  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      tagline: projects.tagline,
      client: projects.client,
      category: projects.category,
      featured: projects.featured,
      displayOrder: projects.displayOrder,
      publishedAt: projects.publishedAt,
      coverPublicId: media.publicId,
      coverWidth: media.width,
      coverHeight: media.height,
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.coverMediaId))
    .where(and(...conds))
    .orderBy(
      desc(projects.featured),
      asc(projects.displayOrder),
      asc(projects.id),
    )
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items: PublicProjectCard[] = rows.slice(0, limit).map((r) => ({
    ...r,
    publishedAt: r.publishedAt as Date,
  }));
  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeProjectCursor({
          f: last.featured ? 1 : 0,
          o: (last as unknown as { displayOrder: number }).displayOrder,
          id: last.id,
        })
      : null;
  return { items, nextCursor };
}

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  client: string | null;
  location: string | null;
  role: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  body: unknown;
  outcome: string | null;
  category: ProjectInput["category"];
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date;
  updatedAt: Date;
  coverPublicId: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  ogPublicId: string | null;
  links: ProjectLinkInput[];
};

/**
 * Full public project by slug — returns null for drafts, missing rows, or
 * noindex rows so the route handler renders 404. Cover + OG image are
 * flattened from the media table in the same query.
 */
export async function getPublishedProjectBySlug(
  slug: string,
): Promise<PublicProject | null> {
  const [row] = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      tagline: projects.tagline,
      client: projects.client,
      location: projects.location,
      role: projects.role,
      periodStart: projects.periodStart,
      periodEnd: projects.periodEnd,
      body: projects.body,
      outcome: projects.outcome,
      category: projects.category,
      metaTitle: projects.metaTitle,
      metaDescription: projects.metaDescription,
      publishedAt: projects.publishedAt,
      updatedAt: projects.updatedAt,
      coverMediaId: projects.coverMediaId,
      coverPublicId: media.publicId,
      coverWidth: media.width,
      coverHeight: media.height,
      ogImageId: projects.ogImageId,
      status: projects.status,
      noindex: projects.noindex,
    })
    .from(projects)
    .leftJoin(media, eq(media.id, projects.coverMediaId))
    .where(eq(projects.slug, slug));
  if (!row || row.status !== "published" || row.noindex) return null;

  // OG image comes from a separate join — one extra tiny lookup only when
  // an OG override was set. Keeping it out of the main SELECT keeps the
  // cover join sane (no double-join to the same table).
  let ogPublicId: string | null = null;
  if (row.ogImageId) {
    const [ogRow] = await db
      .select({ publicId: media.publicId })
      .from(media)
      .where(eq(media.id, row.ogImageId));
    ogPublicId = ogRow?.publicId ?? null;
  }

  const linkRows = await db
    .select({
      kind: projectLinks.kind,
      label: projectLinks.label,
      url: projectLinks.url,
    })
    .from(projectLinks)
    .where(eq(projectLinks.projectId, row.id))
    .orderBy(asc(projectLinks.sortOrder));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    tagline: row.tagline,
    client: row.client,
    location: row.location,
    role: row.role,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    body: row.body,
    outcome: row.outcome,
    category: row.category,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    publishedAt: row.publishedAt as Date,
    updatedAt: row.updatedAt,
    coverPublicId: row.coverPublicId,
    coverWidth: row.coverWidth,
    coverHeight: row.coverHeight,
    ogPublicId,
    links: linkRows,
  };
}
