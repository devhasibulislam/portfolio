import type { MetadataRoute } from "next";
import "server-only";
import { cacheTag } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  categories,
  experiences,
  posts,
  projects,
  tags,
} from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Sitemap DB fan-out — cached under the same tags the underlying data
 * uses, so any post/project/experience save busts it via the existing
 * `updateTag` calls in the dashboard actions. Without this cache boundary
 * every crawler hit runs five queries against Neon.
 */
async function loadSitemapRows() {
  "use cache";
  cacheTag(
    tag.posts(),
    tag.categories(),
    tag.tags(),
    tag.projects(),
    tag.experiences(),
  );
  const [postRows, catRows, tagRows, projectRows, experienceRows] =
    await Promise.all([
      db
        .select({ slug: posts.slug, updatedAt: posts.updatedAt })
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.publishedAt)),
      db.select({ slug: categories.slug }).from(categories),
      db.select({ slug: tags.slug }).from(tags),
      db
        .select({ slug: projects.slug, updatedAt: projects.updatedAt })
        .from(projects)
        .where(
          and(eq(projects.status, "published"), eq(projects.noindex, false)),
        )
        .orderBy(desc(projects.publishedAt)),
      db
        .select({
          slug: experiences.slug,
          updatedAt: experiences.updatedAt,
        })
        .from(experiences)
        .where(
          and(
            eq(experiences.status, "published"),
            eq(experiences.noindex, false),
          ),
        )
        .orderBy(desc(experiences.periodStart)),
    ]);
  return { postRows, catRows, tagRows, projectRows, experienceRows };
}

// ponytail: single sitemap, no chunking. Add per-section chunks when we
// cross Google's 50k URL / 50MB limit.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { postRows, catRows, tagRows, projectRows, experienceRows } =
    await loadSitemapRows();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${SITE_URL}/experience`,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    { url: `${SITE_URL}/skills`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/receipts`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/resume`, changeFrequency: "monthly", priority: 0.7 },
  ];
  const postRoutes = postRows.map((r) => ({
    url: `${SITE_URL}/blog/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const catRoutes = catRows.map((r) => ({
    url: `${SITE_URL}/blog/category/${r.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const tagRoutes = tagRows.map((r) => ({
    url: `${SITE_URL}/blog/tag/${r.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
  const projectRoutes = projectRows.map((r) => ({
    url: `${SITE_URL}/projects/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));
  const experienceRoutes = experienceRows.map((r) => ({
    url: `${SITE_URL}/experience/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...postRoutes,
    ...catRoutes,
    ...tagRoutes,
    ...projectRoutes,
    ...experienceRoutes,
  ];
}
