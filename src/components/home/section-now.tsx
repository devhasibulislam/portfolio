import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";

/**
 * "Now" strip — a single-line, high-signal statement of what the owner
 * is currently doing. Sits between the receipts and the featured work so
 * the visitor knows he isn't just resting on past wins.
 */
export async function SectionNow() {
  const t = await getTranslations("home.now");

  return (
    <section
      aria-labelledby="now-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-14 sm:py-16"
    >
      <ScrollReveal
        className="relative overflow-hidden rounded-[2rem] bg-[var(--color-bg)]/40 p-1.5 ring-1 ring-[var(--color-border)]"
        stagger={0.08}
      >
        <div className="relative rounded-[calc(2rem-0.375rem)] bg-[var(--card)] px-8 py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-12 sm:py-14">
          {/* Corner accent glow */}
          <span
            aria-hidden
            className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-[var(--color-accent)]/15 blur-3xl"
          />

          <div
            data-reveal
            className="flex items-center gap-3 text-[var(--color-accent)]"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-accent)] opacity-70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.32em]">
              {t("eyebrow")}
            </p>
          </div>

          <h2
            data-reveal
            id="now-title"
            className="mt-5 max-w-4xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl"
          >
            {t("title")}
          </h2>

          <p
            data-reveal
            className="text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed sm:text-lg"
          >
            {t("body")}
          </p>

          <div data-reveal className="mt-8">
            <Link
              href="/experience"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
            >
              {t("cta")}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
