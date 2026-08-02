import type { MetadataRoute } from "next";
import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories, posts, tags } from "@/lib/db/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ponytail: single sitemap, no chunking. Add per-section chunks when we
// cross Google's 50k URL / 50MB limit.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postRows, catRows, tagRows] = await Promise.all([
    db
      .select({ slug: posts.slug, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt)),
    db.select({ slug: categories.slug }).from(categories),
    db.select({ slug: tags.slug }).from(tags),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.9 },
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

  return [...staticRoutes, ...postRoutes, ...catRoutes, ...tagRoutes];
}
