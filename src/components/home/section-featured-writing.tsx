import { getCldImageUrl } from "next-cloudinary";
import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listPublishedPostsCursor } from "@/lib/db/queries/public-posts";
import { FeaturedGrid, MediaCard } from "./_shared";

/**
 * Featured writing — home page teaser for `/blog`. Reads the same cursor
 * query the full list uses, capped to 3. Auto-hides when the dashboard
 * has no published posts. Cached under `tag.posts()` so publishing busts
 * it instantly per §13.
 */

async function loadTop3() {
  "use cache";
  cacheTag(tag.posts());
  const page = await listPublishedPostsCursor({ limit: 3 });
  return page.items;
}

type Card = Awaited<
  ReturnType<typeof listPublishedPostsCursor>
>["items"][number];

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
      <FeaturedGrid<Card>
        eyebrow={t("eyebrow")}
        title={t("title")}
        titleId="featured-writing-title"
        seeAllHref="/blog"
        seeAllLabel={t("seeAll")}
        items={rows}
        keyOf={(p) => p.id}
        renderCard={(p) => (
          <MediaCard
            href={`/blog/${p.slug}`}
            coverUrl={
              p.coverPublicId
                ? getCldImageUrl({ src: p.coverPublicId, width: 900 })
                : null
            }
            coverAlt={p.title}
            categoryLabel={p.categoryName ?? "Note"}
            fallbackLabel={p.categoryName ?? "Note"}
            title={p.title}
            excerpt={p.excerpt}
            footerLeft={
              <time
                dateTime={p.publishedAt}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg)]/60"
              >
                {new Date(p.publishedAt).toISOString().slice(0, 10)}
              </time>
            }
          />
        )}
      />
    </section>
  );
}
