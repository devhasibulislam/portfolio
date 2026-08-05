import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { tag } from "@/lib/cache-tags";
import { getActiveResume } from "@/lib/db/queries/resumes";
import { Button } from "@/components/ui/button";
import { ResumeViewerClient } from "@/components/resume-viewer-client";

export const metadata: Metadata = {
  title: "Resume",
  description: "Hasibul Islam — resume (PDF).",
  alternates: { canonical: "/resume" },
};

async function loadActive() {
  "use cache";
  cacheTag(tag.activeResume());
  return getActiveResume();
}

export default async function ResumePage() {
  const resume = await loadActive();
  if (!resume) notFound();

  return (
    <main className="mx-auto flex h-[100svh] w-full max-w-5xl flex-col gap-4 overflow-hidden px-4 pt-20 pb-4 sm:px-6 sm:pt-24 sm:pb-6">
      <div className="flex shrink-0 items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-[0.24em]">
            Resume
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
            Hasibul Islam
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {resume.originalName.replace(/\.pdf$/i, "")} · scroll to preview,
            download to keep.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="shrink-0 sm:hidden"
        >
          <a
            href={resume.url}
            download={resume.originalName}
            rel="noopener"
            aria-label="Download PDF"
          >
            <Download className="size-4" />
          </a>
        </Button>
        <Button asChild size="lg" className="hidden shrink-0 sm:inline-flex">
          <a href={resume.url} download={resume.originalName} rel="noopener">
            <Download className="me-2 size-4" />
            Download PDF
          </a>
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <ResumeViewerClient url={resume.url} />
      </div>
    </main>
  );
}
