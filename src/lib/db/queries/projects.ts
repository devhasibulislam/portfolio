import { and, asc, desc, eq } from "drizzle-orm";
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
