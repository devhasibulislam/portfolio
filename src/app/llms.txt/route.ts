import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { posts } from "@/lib/db/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// llms.txt convention (llmstxt.org): curated index that helps LLM crawlers
// find canonical URLs + short descriptions without scraping every page.
export async function GET() {
  const rows = await db
    .select({
      slug: posts.slug,
      title: posts.title,
      metaDescription: posts.metaDescription,
    })
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));

  const lines = [
    "# Hasibul Islam",
    "",
    "> Senior full-stack engineer. Notes on TypeScript, Next.js, databases, and design.",
    "",
    "## Blog",
    "",
    ...rows.map(
      (r) => `- [${r.title}](${SITE_URL}/blog/${r.slug}): ${r.metaDescription}`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
