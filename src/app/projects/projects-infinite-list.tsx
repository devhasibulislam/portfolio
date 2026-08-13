"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getCldImageUrl } from "next-cloudinary";
import { useTranslations } from "next-intl";
import { useCursor } from "@/hooks/use-cursor";
import { loadMorePublishedProjects } from "@/app/projects/list-actions";
import { Spotlight } from "@/components/home/spotlight";
import type {
  ProjectsPage,
  PublicProjectCard,
} from "@/lib/db/queries/projects";

export function ProjectsInfiniteList({ initial }: { initial: ProjectsPage }) {
  const { items, hasMore, loading, error, loadMore } =
    useCursor<PublicProjectCard>(initial, loadMorePublishedProjects);
  const t = useTranslations("projects");
  const labels = useTranslations("projects.categories");
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "0px 0px 120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <li key={p.id}>
            <ProjectCard project={p} categoryLabel={labels(p.category)} />
          </li>
        ))}
      </ul>
      <div ref={sentinel} aria-hidden className="h-1" />
      {loading ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          {t("loadingMore")}
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive py-6 text-center text-sm">
          {t("loadError")}
        </p>
      ) : null}
    </>
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
    ? getCldImageUrl({ src: project.coverPublicId, width: 800 })
    : null;

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <Spotlight className="mb-4 rounded-lg">
        <div className="img-skeleton aspect-[1200/630] overflow-hidden rounded-lg ring-1 ring-[var(--color-border)]/40 transition-shadow group-hover:ring-[var(--color-accent)]/25">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt={project.title}
              width={project.coverWidth ?? 800}
              height={project.coverHeight ?? 500}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent" />
          )}
        </div>
      </Spotlight>
      <div className="mt-4 flex min-w-0 items-center gap-2 text-sm font-medium">
        <span className="shrink-0 text-[var(--color-accent)]">
          {categoryLabel}
        </span>
        {project.client ? (
          <>
            <span className="shrink-0 text-muted-foreground/50">·</span>
            <span className="text-muted-foreground truncate">
              {project.client}
            </span>
          </>
        ) : null}
      </div>
      <h2 className="mt-3 line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-balance transition-colors group-hover:text-[var(--color-accent-strong)]">
        {project.title}
      </h2>
      <p className="text-muted-foreground mt-3 line-clamp-3 text-base leading-relaxed">
        {project.tagline}
      </p>
    </Link>
  );
}
