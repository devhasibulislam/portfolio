import Link from "next/link";
import { getCldImageUrl } from "next-cloudinary";
import { cacheTag } from "next/cache";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import {
  listPublishedProjects,
  type PublicProjectCard,
} from "@/lib/db/queries/projects";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Featured projects — home page teaser for `/projects`. Reads the same
 * `listPublishedProjects` query the full grid uses, but slices to 3.
 * Returns `null` (via a plain empty check) when the dashboard has no
 * published projects yet so the home page collapses gracefully on day one.
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

  // Grid column count follows content count so a single card doesn't sit
  // in a 3-column layout with two empty gutters on desktop. Two cards get
  // a 2-column layout; three fill the row.
  const gridCols =
    rows.length === 1
      ? "grid-cols-1 max-w-md mx-auto"
      : rows.length === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <section
      aria-labelledby="featured-projects-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:py-28 md:py-32"
    >
      <ScrollReveal
        className="mb-14 flex flex-wrap items-end justify-between gap-6"
        stagger={0.08}
      >
        <div data-reveal className="max-w-2xl">
          <p className="text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-[0.28em]">
            {t("eyebrow")}
          </p>
          <h2
            id="featured-projects-title"
            className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
          >
            {t("title")}
          </h2>
        </div>
        <Link
          data-reveal
          href="/projects"
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
        >
          {t("seeAll")}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </ScrollReveal>

      <ScrollReveal as="ul" className={`grid gap-6 ${gridCols}`} stagger={0.1}>
        {rows.map((p) => (
          <li key={p.id} data-reveal>
            <ProjectCard
              project={p}
              categoryLabel={categoryLabels(p.category)}
            />
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}

function ProjectCard({
  project,
  categoryLabel,
}: {
  project: PublicProjectCard;
  categoryLabel: string;
}) {
  const cover = project.coverPublicId
    ? getCldImageUrl({ src: project.coverPublicId, width: 900 })
    : null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full rounded-[2rem] bg-[var(--color-bg)]/40 p-1.5 ring-1 ring-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[var(--color-accent)]/40"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[var(--card)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt={project.title}
              width={project.coverWidth ?? 900}
              height={project.coverHeight ?? 560}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[var(--color-brand-navy)] to-[var(--color-brand-ink)]">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-fg)]/40">
                {categoryLabel}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {categoryLabel}
          </p>
          <h3 className="mt-3 text-lg font-semibold leading-tight tracking-tight">
            {project.title}
          </h3>
          <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
            {project.tagline}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg)]/60 transition-colors group-hover:text-[var(--color-accent)]">
              Case study
            </span>
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--color-bg)]/60 ring-1 ring-[var(--color-border)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="size-3.5 text-[var(--color-fg)]/80 transition-colors group-hover:text-[var(--color-accent)]" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
