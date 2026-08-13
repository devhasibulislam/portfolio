import { cacheTag } from "next/cache";
import { getCldImageUrl } from "next-cloudinary";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listPublishedProjects } from "@/lib/db/queries/projects";
import { ScrollReveal } from "./scroll-reveal";
import {
  MediaCard,
  SectionHeader,
  SeeAllLink,
  featuredGridCols,
} from "./_shared";

async function loadTop3() {
  "use cache";
  cacheTag(tag.projects());
  const rows = await listPublishedProjects();
  return rows.filter((r) => r.featured).slice(0, 3);
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
      <SectionHeader
        title={t("title")}
        id="featured-projects-title"
        action={<SeeAllLink href="/projects" label={t("seeAll")} />}
      />
      <ScrollReveal
        as="ul"
        className={`grid gap-6 ${featuredGridCols(rows.length)}`}
        stagger={0.1}
      >
        {rows.map((p) => {
          const category = categoryLabels(p.category);
          return (
            <li key={p.id} data-reveal>
              <MediaCard
                href={`/projects/${p.slug}`}
                category={category}
                title={p.title}
                body={p.tagline}
                cover={
                  p.coverPublicId
                    ? getCldImageUrl({ src: p.coverPublicId, width: 900 })
                    : null
                }
                coverWidth={p.coverWidth}
                coverHeight={p.coverHeight}
                footerLeft={
                  <span className="text-sm text-[var(--color-fg)]/60 transition-colors group-hover:text-[var(--color-accent)]">
                    Case study
                  </span>
                }
              />
            </li>
          );
        })}
      </ScrollReveal>
    </section>
  );
}
