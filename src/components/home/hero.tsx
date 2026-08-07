import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HeroReveal } from "./hero-reveal";
import { SplitHeroMetric } from "./split-hero-metric";
import { HeroLogoMarquee } from "./hero-logo-marquee";
import { CtaButton } from "@/components/cta-button";

/**
 * Home hero — centered display layout. The promise sits above the fold
 * (chip → title → role → receipt strip → CTAs) and a client-trust
 * marquee anchors the bottom of the viewport. `<HeroReveal>` staggers
 * `data-hero-line` children on mount; `<SplitHeroMetric>` char-splits
 * the receipt metric.
 */
export async function Hero() {
  const t = await getTranslations("home.hero2");

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100dvh] w-full flex-col overflow-hidden px-6 pt-32 pb-12 sm:pt-40 sm:pb-16 md:pt-44"
    >
      {/* Soft radial vignette lifting type off the dotted backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 0%, var(--color-bg) 80%)",
        }}
      />

      <HeroReveal className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        {/* Availability chip */}
        <p
          data-hero-line
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 py-1.5 pe-4 ps-3 text-xs font-medium text-emerald-600 backdrop-blur sm:text-sm dark:text-emerald-300"
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {t("availability")}
        </p>

        {/* Title — the anchor */}
        <h1
          id="hero-title"
          data-hero-line
          className="mt-8 max-w-3xl text-4xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-[4.5rem]"
        >
          {t("title")}
        </h1>

        {/* Role + location */}
        <p
          data-hero-line
          className="text-muted-foreground mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
        >
          {t("role")}
        </p>
        <p
          data-hero-line
          className="text-muted-foreground/70 mt-1 max-w-2xl text-sm sm:text-base"
        >
          {t("location")}
        </p>

        {/* Receipt strip — evidence in one line. dir="ltr" protects the
            before → after reading direction in RTL locales. */}
        <p
          data-hero-line
          dir="ltr"
          className="mt-8 inline-flex max-w-full items-center gap-x-3 gap-y-1 overflow-hidden rounded-full border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-bg)]/60 py-2 ps-3 pe-4 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase backdrop-blur-sm sm:text-xs"
        >
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
            p95 · production
          </span>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          <span className="whitespace-nowrap normal-case tracking-normal">
            <SplitHeroMetric>
              <span className="text-muted-foreground/60">
                {t("metricFrom")}
              </span>
              <span
                aria-hidden
                className="mx-1.5 inline-block text-[var(--color-accent)]"
                style={{ textShadow: "0 0 18px rgba(232,107,28,0.55)" }}
              >
                →
              </span>
              <span className="text-[var(--color-fg)]">{t("metricTo")}</span>
            </SplitHeroMetric>
          </span>
          <span
            aria-hidden
            className="hidden text-muted-foreground/40 sm:inline"
          >
            ·
          </span>
          <span className="hidden max-w-[22ch] truncate whitespace-nowrap normal-case tracking-normal sm:inline">
            {t("metricCaption")}
          </span>
        </p>

        {/* CTAs */}
        <div
          data-hero-line
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <CtaButton href="/projects">{t("primaryCta")}</CtaButton>
          <CtaButton
            href="/resume"
            variant="secondary"
            leadIcon={<FileText className="size-4" />}
          >
            {t("secondaryCta")}
          </CtaButton>
        </div>
      </HeroReveal>

      {/* Trust strip — anchors the bottom of the fold */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-6xl">
        <HeroLogoMarquee label="Trusted by teams I've shipped for" />
      </div>
    </section>
  );
}
