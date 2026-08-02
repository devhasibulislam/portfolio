import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { tag } from "@/lib/cache-tags";
import { getActiveResume } from "@/lib/db/queries/resumes";
import { Button } from "@/components/ui/button";

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
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl flex-col gap-6 px-6 pt-24 pb-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-[0.24em]">
            Resume
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {resume.originalName.replace(/\.pdf$/i, "")}
          </h1>
        </div>
        <Button asChild size="lg">
          <a href={resume.url} download={resume.originalName} rel="noopener">
            <Download className="me-2 size-4" />
            Download PDF
          </a>
        </Button>
      </div>

      <object
        data={resume.url}
        type="application/pdf"
        className="min-h-[75vh] w-full flex-1 rounded-xl border shadow-sm"
        aria-label={resume.originalName}
      >
        {/* Fallback for browsers without inline PDF viewers (iOS Safari). */}
        <div className="text-muted-foreground p-8 text-center text-sm">
          Your browser can&apos;t display the PDF inline.{" "}
          <a
            href={resume.url}
            className="text-[var(--color-accent)] underline"
            target="_blank"
            rel="noopener"
          >
            Open it in a new tab
          </a>
          .
        </div>
      </object>
    </main>
  );
}
