import { getCldImageUrl } from "next-cloudinary";
import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import {
  listPublishedProjects,
  type PublicProjectCard,
} from "@/lib/db/queries/projects";
import { FeaturedGrid, MediaCard } from "./_shared";

/**
 * Featured projects — home page teaser for `/projects`. Reads the same
 * `listPublishedProjects` query the full grid uses, but slices to 3.
 * Returns `null` when the dashboard has no published projects yet so the
 * home page collapses gracefully on day one.
 *
 * Cached under `tag.projects()` so dashboard mutations bust it instantly
 * per §13. No time-based revalidation.
 */

async function loadTop3() {
  "use cache";
  cacheTag(tag.projects());
  const rows = await listPublishedProjects();
  return rows.slice(0, 3);
}

export async function SectionFeaturedProjects() {
  const [rows, t, categoryLabels] = await Promise.all([
    loadTop3(),
    getTranslations("home.featuredProjects"),
    getTranslations("projects.categories"),
  ]);
  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-projects-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <FeaturedGrid<PublicProjectCard>
        eyebrow={t("eyebrow")}
        title={t("title")}
        titleId="featured-projects-title"
        seeAllHref="/projects"
        seeAllLabel={t("seeAll")}
        items={rows}
        keyOf={(p) => p.id}
        renderCard={(p) => (
          <MediaCard
            href={`/projects/${p.slug}`}
            coverUrl={
              p.coverPublicId
                ? getCldImageUrl({ src: p.coverPublicId, width: 900 })
                : null
            }
            coverWidth={p.coverWidth}
            coverHeight={p.coverHeight}
            coverAlt={p.title}
            categoryLabel={categoryLabels(p.category)}
            fallbackLabel={categoryLabels(p.category)}
            title={p.title}
            excerpt={p.tagline}
            footerLeft={
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg)]/60 transition-colors group-hover:text-[var(--color-accent)]">
                Case study
              </span>
            }
          />
        )}
      />
    </section>
  );
}
