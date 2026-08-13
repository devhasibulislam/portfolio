import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BlogInfiniteList } from "@/app/blog/blog-infinite-list";
import { tag } from "@/lib/cache-tags";
import {
  getTagBySlug,
  listPublishedPostsCursor,
} from "@/lib/db/queries/public-posts";
import { loadMorePublishedPosts } from "@/app/blog/actions";
import { PAGE_INITIAL } from "@/lib/pagination";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

type Params = { slug: string };

async function loadPage(slug: string) {
  "use cache";
  cacheTag(tag.posts(), tag.tags());
  const [tagRow, page] = await Promise.all([
    getTagBySlug(slug),
    listPublishedPostsCursor({ limit: PAGE_INITIAL, tagSlug: slug }),
  ]);
  return { tagRow, page };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { tagRow } = await loadPage(slug);
  const [tCommon, tBlog] = await Promise.all([
    getTranslations("common"),
    getTranslations("blog"),
  ]);
  if (!tagRow) return { title: tCommon("notFoundTitle") };
  return {
    title: `#${tagRow.name}`,
    description: tBlog("tagMetaDescription", { name: tagRow.name }),
    alternates: { canonical: `/blog/tag/${tagRow.slug}` },
  };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [{ tagRow, page }, t] = await Promise.all([
    loadPage(slug),
    getTranslations("blog"),
  ]);
  if (!tagRow) notFound();

  const boundLoader = loadMorePublishedPosts.bind(null, {
    tagSlug: tagRow.slug,
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pt-24 pb-12">
      <PageBreadcrumb
        trail={[
          { label: t("heading"), href: "/blog" },
          { label: `#${tagRow.name}` },
        ]}
      />
      <header className="mb-10">
        <p className="text-muted-foreground text-sm">{t("tagEyebrow")}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          #{tagRow.name}
        </h1>
      </header>
      <BlogInfiniteList initial={page} loader={boundLoader} />
    </main>
  );
}
