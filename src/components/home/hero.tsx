import Image from "next/image";
import { MoveRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";
import { SplitHeroMetric } from "./split-hero-metric";
import { HeroLogoMarquee } from "./hero-logo-marquee";
import { SlideToOpenCta } from "./slide-to-open-cta";
import { CtaButton } from "@/components/cta-button";

/**
 * Home hero — centered display, prose-first. No eyebrow chip, no
 * receipt pill: the metric sits inside body prose so numbers read as
 * evidence rather than as a "technical" costume. `<ScrollReveal trigger="mount">`
 * staggers `data-hero-line` children; `<SplitHeroMetric>` char-splits the metric.
 */
export async function Hero() {
  const t = await getTranslations("home.hero2");

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden px-6 pt-32 pb-12 sm:pt-40 sm:pb-16 md:pt-44"
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

      <ScrollReveal
        trigger="mount"
        selector="[data-hero-line]"
        y={42}
        stagger={0.12}
        className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center"
      >
        {/* Title — carries its own weight, no eyebrow. */}
        <h1
          id="hero-title"
          data-hero-line
          className="max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.03em] text-balance sm:text-5xl md:text-6xl lg:text-[4.5rem]"
        >
          {t("title")}
        </h1>

        {/* Role — one voice, not a chip stack. */}
        <p
          data-hero-line
          className="text-muted-foreground mt-6 max-w-2xl text-base leading-relaxed text-balance sm:text-lg"
        >
          {t("role")}
        </p>

        {/* Metric line — prose, not a pill. Numbers in mono because
            measurement earns it; `dir="ltr"` protects before → after
            in RTL locales. */}
        <p
          data-hero-line
          className="text-muted-foreground mt-8 flex max-w-2xl flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-sm sm:text-base"
        >
          <SplitHeroMetric>
            <span
              dir="ltr"
              className="inline-flex items-center gap-2 whitespace-nowrap"
            >
              <span className="font-mono text-lg tracking-[-0.03em] text-[var(--color-fg)] sm:text-xl">
                {t("metricFrom")}
              </span>
              <MoveRight
                aria-hidden
                className="size-5 shrink-0 text-[var(--color-accent)] drop-shadow-[0_0_10px_rgba(232,107,28,0.55)] sm:size-6"
                strokeWidth={2.25}
              />
              <span className="font-mono text-lg tracking-[-0.03em] text-[var(--color-fg)] sm:text-xl">
                {t("metricTo")}
              </span>
            </span>
          </SplitHeroMetric>
          <span>{t("metricCaption")}</span>
        </p>

        {/* CTAs */}
        <div
          data-hero-line
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <CtaButton href="/projects" className="w-48 justify-between">
            {t("primaryCta")}
          </CtaButton>
          <SlideToOpenCta
            href="https://calendly.com/devhasibulislam/30min"
            tooltip={t("slideTooltip")}
            leadIcon={
              <Image
                src="/social/google-meet.webp"
                alt=""
                width={20}
                height={20}
                className="pointer-events-none size-5 object-contain select-none"
                draggable={false}
                unoptimized
              />
            }
          >
            {t("secondaryCta")}
          </SlideToOpenCta>
        </div>

        {/* Availability — demoted to a quiet signal beneath the CTAs. */}
        <p
          data-hero-line
          className="text-muted-foreground mt-6 inline-flex items-center gap-2 text-sm"
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {t("availability")}
        </p>
      </ScrollReveal>

      {/* Trust strip — anchors the bottom of the fold */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-6xl">
        <HeroLogoMarquee
          label={t("marqueeLabel")}
          ariaLabel={t("marqueeAriaLabel")}
        />
      </div>
    </section>
  );
}
