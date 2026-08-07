import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";
import { ArrowUpRight } from "lucide-react";
import { tag } from "@/lib/cache-tags";
import { getPublishedExperienceBySlug } from "@/lib/db/queries/experience";
import { renderTiptapToHtml } from "@/lib/tiptap-render";
import type { ExperienceInput } from "@/schemas/experience";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Params = { slug: string };

async function loadRole(slug: string) {
  "use cache";
  cacheTag(tag.experience(slug), tag.experiences());
  return getPublishedExperienceBySlug(slug);
}

const WORK_TYPE_LABEL: Record<
  NonNullable<ExperienceInput["workType"]>,
  string
> = {
  on_site: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const role = await loadRole(slug);
  if (!role) return { title: "Not found" };

  const title = role.metaTitle ?? `${role.role} · ${role.company}`;
  const description = role.metaDescription ?? role.summary;
  const url = `${SITE_URL}/experience/${role.slug}`;
  const ogSource = role.ogPublicId ?? role.logoPublicId;
  const og = ogSource
    ? getCldImageUrl({ src: ogSource, width: 1200, height: 630 })
    : null;

  return {
    title,
    description,
    alternates: { canonical: `/experience/${role.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: role.publishedAt.toISOString(),
      modifiedTime: role.updatedAt.toISOString(),
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

function formatPeriod(start: Date, end: Date | null): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return `${fmt(start)} to ${end ? fmt(end) : "Present"}`;
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const role = await loadRole(slug);
  if (!role) notFound();

  const highlightsHtml = renderTiptapToHtml(role.highlights);
  const period = formatPeriod(role.periodStart, role.periodEnd);
  const logo = role.logoPublicId
    ? getCldImageUrl({
        src: role.logoPublicId,
        width: 200,
        height: 200,
      })
    : null;

  // JSON-LD: a role is best modelled as WorkPosition attached to Person via
  // hasOccupation. Keeps the page indexable as employment history without
  // pretending it's a JobPosting (which Google treats as a hiring listing).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${role.role} · ${role.company}`,
    description: role.metaDescription ?? role.summary,
    url: `${SITE_URL}/experience/${role.slug}`,
    datePublished: role.publishedAt.toISOString(),
    dateModified: role.updatedAt.toISOString(),
    about: {
      "@type": "Person",
      name: "Hasibul Islam",
      hasOccupation: {
        "@type": "Occupation",
        name: role.role,
        occupationLocation: role.location
          ? { "@type": "Place", name: role.location }
          : undefined,
      },
      worksFor: {
        "@type": "Organization",
        name: role.company,
        url: role.companyUrl ?? undefined,
      },
    },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageBreadcrumb
        trail={[
          { label: "Experience", href: "/experience" },
          { label: role.role },
        ]}
      />

      <header className="mb-10 flex items-start gap-4">
        {logo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logo}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-md bg-[var(--color-accent)]/10" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-accent)]">
            {role.companyUrl ? (
              <a
                href={role.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:opacity-80"
              >
                {role.company}
                <ArrowUpRight className="size-3" />
              </a>
            ) : (
              role.company
            )}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl md:text-5xl">
            {role.role}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tabular-nums">
            {period}
            {role.location ? ` · ${role.location}` : ""}
            {role.workType ? ` · ${WORK_TYPE_LABEL[role.workType]}` : ""}
          </p>
        </div>
      </header>

      <p className="text-foreground mb-10 text-lg leading-relaxed">
        {role.summary}
      </p>

      {highlightsHtml ? (
        <article
          className="prose dark:prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: highlightsHtml }}
        />
      ) : null}
    </main>
  );
}
