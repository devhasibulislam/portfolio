import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HeroMeshGate } from "./hero-mesh-gate";
import { HeroReveal } from "./hero-reveal";
import { Button } from "@/components/ui/button";

/**
 * Home hero — metric-first. The first thing a visitor sees is a big
 * ~200 ms → ~20 ms hot-path rewrite receipt. Everything else on the page
 * hangs off that hook. Structure:
 *
 *   [ eyebrow "The receipts" ]
 *   [ 200 ms  →  20 ms ]          <- mono, giant, brand orange arrow
 *   [ caption ]
 *   [ title (sans, large, tight) ]
 *   [ role · stack ]
 *   [ location · availability ]
 *   [ CTA row: See the work | Read the resume ]
 *
 * Three.js drifting mesh sits behind the type on capable devices; the CSS
 * starfield behind that (rendered globally, see `page.tsx`).
 */
export async function Hero() {
  const t = await getTranslations("home.hero2");

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100dvh] w-full flex-col items-start justify-center overflow-hidden px-6 pt-32 pb-16 sm:pt-40 sm:pb-24 md:pt-48"
    >
      {/* Three.js sits behind the type on capable devices. Absolute-positioned,
          zero pointer events — the CSS starfield paints under everything. */}
      <HeroMeshGate />

      {/* Radial vignette to lift the type off the busy background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, transparent 0%, var(--color-bg) 78%)",
        }}
      />

      <HeroReveal className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Eyebrow pill */}
        <p
          data-hero-line
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)] backdrop-blur"
        >
          <span className="size-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
          {t("eyebrow")}
        </p>

        {/* The metric — the hook. Mono, huge, arrow in brand orange.
            `dir="ltr"` is critical: in RTL locales (ar/he/ur) the browser
            would otherwise mirror the `200 ms → 20 ms` sequence into
            `20 ms → 200 ms`, breaking the "before → after" reading.
            `whitespace-nowrap` keeps the whole receipt on one line and the
            size ramps up progressively so it never orphans "ms" on
            tablet/mobile. */}
        <p
          data-hero-line
          dir="ltr"
          className="font-mono text-[2.75rem] leading-none tracking-[-0.04em] whitespace-nowrap sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8.5rem]"
        >
          <span className="text-muted-foreground/60">{t("metricFrom")}</span>
          <span
            aria-hidden
            className="mx-2 inline-block text-[var(--color-accent)] sm:mx-4 md:mx-5"
            style={{
              textShadow: "0 0 32px rgba(232,107,28,0.55)",
            }}
          >
            →
          </span>
          <span className="text-[var(--color-fg)]">{t("metricTo")}</span>
        </p>

        {/* Caption under the metric */}
        <p
          data-hero-line
          className="text-muted-foreground mt-4 max-w-2xl font-mono text-xs uppercase tracking-[0.18em] sm:text-sm"
        >
          {t("metricCaption")}
        </p>

        {/* Title — the promise. */}
        <h1
          id="hero-title"
          data-hero-line
          className="mt-10 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {t("title")}
        </h1>

        {/* Role stack */}
        <p
          data-hero-line
          className="text-muted-foreground mt-6 max-w-3xl font-mono text-xs sm:text-sm"
        >
          {t("role")}
        </p>
        <p
          data-hero-line
          className="text-muted-foreground/70 mt-1 max-w-3xl font-mono text-xs sm:text-sm"
        >
          {t("location")}
        </p>

        {/* CTA row — primary uses the "button-in-button" trailing-icon
            pattern per the high-end-visual-design skill. */}
        <div
          data-hero-line
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className="group h-12 gap-3 rounded-full bg-[var(--color-accent)] pe-1.5 ps-6 text-sm font-semibold text-[color:var(--primary-foreground)] shadow-[0_0_0_1px_rgba(232,107,28,0.35),0_8px_28px_-6px_rgba(232,107,28,0.55)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--color-accent-strong)] active:scale-[0.98]"
          >
            <Link href="/projects">
              {t("primaryCta")}
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-black/20 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-12 gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-5 text-sm font-medium text-[var(--color-fg)] backdrop-blur transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg)]/60 hover:text-[var(--color-accent)]"
          >
            <Link href="/resume">
              <FileText className="size-4" />
              {t("secondaryCta")}
            </Link>
          </Button>
        </div>
      </HeroReveal>

      {/* Subtle "scroll to explore" hint at the bottom-center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center"
      >
        <span className="text-muted-foreground/50 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
          <span className="h-8 w-px animate-pulse bg-current" />
          scroll
        </span>
      </div>
    </section>
  );
}
