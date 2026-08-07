import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";
import {
  AppWindow,
  BookOpen,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Globe,
  MonitorPlay,
  PlayCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { tag } from "@/lib/cache-tags";
import { getPublishedProjectBySlug } from "@/lib/db/queries/projects";
import { renderTiptapToHtml } from "@/lib/tiptap-render";
import type { ProjectLinkInput } from "@/schemas/project";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { ContactCTA } from "@/components/contact-cta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Params = { slug: string };

async function loadProject(slug: string) {
  "use cache";
  cacheTag(tag.project(slug), tag.projects());
  return getPublishedProjectBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return { title: "Not found" };

  const title = project.metaTitle ?? project.title;
  const description = project.metaDescription ?? project.tagline;
  const url = `${SITE_URL}/projects/${project.slug}`;
  const ogSource = project.ogPublicId ?? project.coverPublicId;
  const og = ogSource
    ? getCldImageUrl({ src: ogSource, width: 1200, height: 630 })
    : null;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: project.publishedAt.toISOString(),
      modifiedTime: project.updatedAt.toISOString(),
      images: og ? [{ url: og, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: og ? [og] : undefined,
    },
  };
}

const LINK_META: Record<
  ProjectLinkInput["kind"],
  { icon: LucideIcon; hint: string }
> = {
  website: { icon: Globe, hint: "Website" },
  case_study: { icon: BookOpen, hint: "Case study" },
  github: { icon: Code2, hint: "GitHub" },
  demo: { icon: MonitorPlay, hint: "Demo" },
  app_store: { icon: AppWindow, hint: "App Store" },
  play_store: { icon: Download, hint: "Play Store" },
  docs: { icon: FileText, hint: "Docs" },
  video: { icon: PlayCircle, hint: "Video" },
};

const CATEGORY_LABEL: Record<
  Awaited<ReturnType<typeof getPublishedProjectBySlug>> extends infer T
    ? T extends { category: infer C }
      ? C
      : never
    : never,
  string
> = {
  enterprise: "Client engagement",
  product: "Product",
  open_source: "Open source",
  nda: "Under NDA",
};

function formatPeriod(start: Date | null, end: Date | null): string | null {
  if (!start) return null;
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  return `${fmt(start)} to ${end ? fmt(end) : "Present"}`;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();

  const bodyHtml = renderTiptapToHtml(project.body);
  const period = formatPeriod(project.periodStart, project.periodEnd);
  const cover = project.coverPublicId
    ? getCldImageUrl({ src: project.coverPublicId, width: 1600 })
    : null;

  // JSON-LD: CreativeWork by default. If the project has an app-store link
  // it's really a SoftwareApplication — bump the @type so Google's rich
  // results parser can index the install links.
  const hasApp = project.links.some(
    (l) => l.kind === "app_store" || l.kind === "play_store",
  );
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": hasApp ? "SoftwareApplication" : "CreativeWork",
    name: project.title,
    description: project.metaDescription ?? project.tagline,
    url: `${SITE_URL}/projects/${project.slug}`,
    datePublished: project.publishedAt.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    creator: { "@type": "Person", name: "Hasibul Islam" },
  };
  if (hasApp) {
    jsonLd.applicationCategory = "BusinessApplication";
    jsonLd.operatingSystem = "iOS, Android";
    jsonLd.downloadUrl = project.links
      .filter((l) => l.kind === "app_store" || l.kind === "play_store")
      .map((l) => l.url);
  }
  if (cover) jsonLd.image = cover;

  return (
    <>
    <main className="mx-auto w-full max-w-3xl px-6 pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBreadcrumb
        trail={[
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
      />

      <header className="mb-10 flex flex-col gap-4">
        <p className="text-sm font-medium text-[var(--color-accent)]">
          {CATEGORY_LABEL[project.category]}
          {project.client ? ` · ${project.client}` : ""}
        </p>
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {project.title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {project.tagline}
        </p>
        {period || project.location || project.role ? (
          <p className="text-muted-foreground/80 text-sm">
            {[project.role, project.location, period]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </header>

      {cover ? (
        <div className="img-skeleton mb-10 overflow-hidden rounded-lg">
          {/* Cloudinary CDN handles f_auto/q_auto — plain <img> avoids
              pulling next/image runtime cost twice. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={project.title}
            width={project.coverWidth ?? 1600}
            height={project.coverHeight ?? 900}
            className="h-auto w-full"
          />
        </div>
      ) : null}

      {bodyHtml ? (
        <article
          className="prose dark:prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : null}

      {project.outcome ? (
        <aside className="mt-10 rounded-lg border-s-2 border-[var(--color-accent)] bg-[var(--color-accent)]/5 p-5">
          <p className="text-[var(--color-accent)] mb-1 text-sm font-medium">
            Outcome
          </p>
          <p className="text-foreground leading-relaxed">{project.outcome}</p>
        </aside>
      ) : null}

      {project.links.length > 0 ? (
        <footer className="mt-12 border-t pt-8">
          <p className="text-muted-foreground mb-3 text-sm font-medium">
            Links
          </p>
          <ul className="flex flex-wrap gap-2">
            {project.links.map((link) => {
              const meta = LINK_META[link.kind];
              const Icon = meta.icon;
              return (
                <li key={`${link.kind}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)] inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors"
                    title={meta.hint}
                  >
                    <Icon className="size-3.5" />
                    <span>{link.label}</span>
                    <ExternalLink className="size-3 opacity-50" />
                  </a>
                </li>
              );
            })}
          </ul>
        </footer>
      ) : null}
    </main>
    <ContactCTA />
    </>
  );
}
