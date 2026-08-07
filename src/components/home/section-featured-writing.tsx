import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listPublishedPostsCursor } from "@/lib/db/queries/public-posts";
import { ScrollReveal } from "./scroll-reveal";
import {
  ArticleCard,
  SectionHeader,
  SeeAllLink,
  featuredGridCols,
} from "./_shared";

async function loadTop3() {
  "use cache";
  cacheTag(tag.posts());
  const page = await listPublishedPostsCursor({ limit: 3 });
  return page.items;
}

export async function SectionFeaturedWriting() {
  const [rows, t] = await Promise.all([
    loadTop3(),
    getTranslations("home.featuredWriting"),
  ]);

  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-writing-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <SectionHeader
        title={t("title")}
        id="featured-writing-title"
        action={<SeeAllLink href="/blog" label={t("seeAll")} />}
      />
      <ScrollReveal
        as="ul"
        className={`grid gap-6 ${featuredGridCols(rows.length)}`}
        stagger={0.1}
      >
        {rows.map((p) => {
          const category = p.categoryName ?? "Note";
          return (
            <li key={p.id} data-reveal>
              <ArticleCard
                href={`/blog/${p.slug}`}
                category={category}
                title={p.title}
                body={p.excerpt}
                date={p.publishedAt}
              />
            </li>
          );
        })}
      </ScrollReveal>
    </section>
  );
}
