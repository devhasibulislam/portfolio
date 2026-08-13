import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listPublishedExperienceCursor } from "@/lib/db/queries/experience";
import { PAGE_INITIAL } from "@/lib/pagination";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { ExperienceInfiniteList } from "@/app/experience/experience-infinite-list";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.experience");
  const title = m("title");
  const description = m("description");
  return {
    title,
    description,
    alternates: { canonical: "/experience" },
    openGraph: {
      type: "website",
      title: `${title} · Hasibul Islam`,
      description,
      url: `${SITE_URL}/experience`,
    },
  };
}

async function firstPage() {
  "use cache";
  cacheTag(tag.experiences());
  return listPublishedExperienceCursor({ limit: PAGE_INITIAL });
}

export default async function ExperiencePage() {
  const [initial, t] = await Promise.all([
    firstPage(),
    getTranslations("experience"),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-24 pb-24">
      <PageBreadcrumb trail={[{ label: t("heading") }]} />
      <header className="mb-16 max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {t("hero")}
        </p>
      </header>
      <ExperienceInfiniteList initial={initial} />
    </main>
  );
}
