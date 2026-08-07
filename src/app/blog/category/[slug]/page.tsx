import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { BlogInfiniteList } from "@/app/blog/blog-infinite-list";
import { tag } from "@/lib/cache-tags";
import {
  getCategoryBySlug,
  listPublishedPostsCursor,
} from "@/lib/db/queries/public-posts";
import { loadMoreCategoryPosts } from "./actions";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

type Params = { slug: string };

async function loadPage(slug: string) {
  "use cache";
  cacheTag(tag.posts(), tag.categories());
  const [category, page] = await Promise.all([
    getCategoryBySlug(slug),
    listPublishedPostsCursor({ limit: 12, categorySlug: slug }),
  ]);
  return { category, page };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await loadPage(slug);
  if (!category) return { title: "Not found" };
  return {
    title: category.name,
    description: `Posts in ${category.name}.`,
    alternates: { canonical: `/blog/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { category, page } = await loadPage(slug);
  if (!category) notFound();

  const boundLoader = loadMoreCategoryPosts.bind(null, category.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pt-24 pb-12">
      <PageBreadcrumb
        trail={[{ label: "Blog", href: "/blog" }, { label: category.name }]}
      />
      <header className="mb-10">
        <p className="text-muted-foreground text-sm">Category</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {category.name}
        </h1>
      </header>
      <BlogInfiniteList initial={page} loader={boundLoader} />
    </main>
  );
}
