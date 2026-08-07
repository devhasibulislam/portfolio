import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { getActiveResume } from "@/lib/db/queries/resumes";
import { CtaButton } from "@/components/cta-button";
import { ResumeViewerClient } from "@/components/resume-viewer-client";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.resume");
  return {
    title: m("title"),
    description: m("description"),
    alternates: { canonical: "/resume" },
  };
}

async function loadActive() {
  "use cache";
  cacheTag(tag.activeResume());
  return getActiveResume();
}

export default async function ResumePage() {
  const [resume, t, tNav] = await Promise.all([
    loadActive(),
    getTranslations("resume"),
    getTranslations("nav"),
  ]);
  if (!resume) notFound();

  const filename = resume.originalName.replace(/\.pdf$/i, "");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-24">
      <PageBreadcrumb trail={[{ label: tNav("resume") }]} />
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-4xl md:text-5xl">
            {t("heading")}
          </h1>
          <p className="text-muted-foreground mt-3 text-base sm:text-lg">
            {t("subtitle", { name: filename })}
          </p>
        </div>
        <CtaButton href={resume.url} download={resume.originalName}>
          {t("download")}
        </CtaButton>
      </div>

      <div className="w-full">
        <ResumeViewerClient url={resume.url} />
      </div>
    </main>
  );
}
