import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { BlogInfiniteList } from "@/app/blog/blog-infinite-list";
import { tag } from "@/lib/cache-tags";
import {
  getTagBySlug,
  listPublishedPostsCursor,
} from "@/lib/db/queries/public-posts";
import { loadMoreTagPosts } from "./actions";

type Params = { slug: string };

async function loadPage(slug: string) {
  "use cache";
  cacheTag(tag.posts(), tag.tags());
  const [t, page] = await Promise.all([
    getTagBySlug(slug),
    listPublishedPostsCursor({ limit: 12, tagSlug: slug }),
  ]);
  return { t, page };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { t } = await loadPage(slug);
  if (!t) return { title: "Not found" };
  return {
    title: `#${t.name}`,
    description: `Posts tagged ${t.name}.`,
    alternates: { canonical: `/blog/tag/${t.slug}` },
  };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { t, page } = await loadPage(slug);
  if (!t) notFound();

  const boundLoader = loadMoreTagPosts.bind(null, t.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="text-muted-foreground text-sm uppercase tracking-wider">
          Tag
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          #{t.name}
        </h1>
      </header>
      <BlogInfiniteList initial={page} loader={boundLoader} />
    </main>
  );
}
