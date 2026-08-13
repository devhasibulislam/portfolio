import type { Metadata } from "next";
import Link from "next/link";
import { cacheTag } from "next/cache";
import { getCldImageUrl } from "next-cloudinary";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { Spotlight } from "@/components/home/spotlight";
import {
  listPublishedProjects,
  type PublicProjectCard,
} from "@/lib/db/queries/projects";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.projects");
  const title = m("title");
  const description = m("description");
  return {
    title,
    description,
    alternates: { canonical: "/projects" },
    openGraph: {
      type: "website",
      title: `${title} · Hasibul Islam`,
      description,
      url: `${SITE_URL}/projects`,
    },
  };
}

async function loadProjects() {
  "use cache";
  cacheTag(tag.projects());
  return listPublishedProjects();
}

export default async function ProjectsPage() {
  const [rows, t, categoryLabels] = await Promise.all([
    loadProjects(),
    getTranslations("projects"),
    getTranslations("projects.categories"),
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

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <li key={p.id}>
              <ProjectCard
                project={p}
                categoryLabel={categoryLabels(p.category)}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
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
            <span className="truncate text-muted-foreground">
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
