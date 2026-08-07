import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { BlogInfiniteList } from "./blog-infinite-list";
import { tag } from "@/lib/cache-tags";
import { listPublishedPostsCursor } from "@/lib/db/queries/public-posts";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.blog");
  return {
    title: m("title"),
    description: m("description"),
    alternates: { canonical: "/blog" },
  };
}

async function firstPage() {
  "use cache";
  cacheTag(tag.posts());
  return listPublishedPostsCursor({ limit: 12 });
}

export default async function BlogPage() {
  const [initial, t] = await Promise.all([
    firstPage(),
    getTranslations("blog"),
  ]);
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pt-24 pb-24">
      <PageBreadcrumb trail={[{ label: t("heading") }]} />
      <header className="mb-14 max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {t("hero")}
        </p>
      </header>
      <BlogInfiniteList initial={initial} />
    </main>
  );
}
