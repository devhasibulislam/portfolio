import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { BlogInfiniteList } from "./blog-infinite-list";
import { tag } from "@/lib/cache-tags";
import { listPublishedPostsCursor } from "@/lib/db/queries/public-posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on building things — TypeScript, Next.js, databases, and design.",
  alternates: { canonical: "/blog" },
};

async function firstPage() {
  "use cache";
  cacheTag(tag.posts());
  return listPublishedPostsCursor({ limit: 12 });
}

export default async function BlogPage() {
  const initial = await firstPage();
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Blog
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Notes on building things.
        </p>
      </header>
      <BlogInfiniteList initial={initial} />
    </main>
  );
}
