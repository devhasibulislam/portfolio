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
    <main className="mx-auto w-full max-w-6xl px-6 pt-8 pb-24">
      <header className="mb-14 max-w-2xl">
        <p className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-[0.24em]">
          Writing
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Blog
        </h1>
        <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
          Field notes on shipping — TypeScript, Node, databases, and the
          occasional design detour.
        </p>
      </header>
      <BlogInfiniteList initial={initial} />
    </main>
  );
}
