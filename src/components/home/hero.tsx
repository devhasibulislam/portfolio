import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HeroReveal } from "./hero-reveal";
import { SplitHeroMetric } from "./split-hero-metric";
import { CtaButton } from "@/components/cta-button";

/**
 * Home hero — metric-first. The p95 receipt is the hook; identity and
 * CTAs sit under it. Backdrop is the shared CSS `<StarBackdrop>` painted
 * globally from `page.tsx`. GSAP `<HeroReveal>` staggers `data-hero-line`
 * children on mount.
 */
export async function Hero() {
  const t = await getTranslations("home.hero2");

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100dvh] w-full flex-col items-start justify-center overflow-hidden px-6 pt-32 pb-16 sm:pt-40 sm:pb-24 md:pt-48"
    >
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
        {/* The metric — the hook. Real measurement, so mono earns its
            place here. `dir="ltr"` protects the before → after reading
            direction in RTL locales. */}
        <p
          data-hero-line
          dir="ltr"
          className="font-mono text-[2.75rem] leading-none tracking-[-0.04em] whitespace-nowrap sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8.5rem]"
        >
          <SplitHeroMetric>
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
          </SplitHeroMetric>
        </p>

        {/* Caption under the metric */}
        <p
          data-hero-line
          className="text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
        >
          {t("metricCaption")}
        </p>

        {/* Title — the promise. */}
        <h1
          id="hero-title"
          data-hero-line
          className="mt-10 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {t("title")}
        </h1>

        {/* Role + location */}
        <p
          data-hero-line
          className="text-muted-foreground mt-6 max-w-3xl text-base leading-relaxed sm:text-lg"
        >
          {t("role")}
        </p>
        <p
          data-hero-line
          className="text-muted-foreground/70 mt-1 max-w-3xl text-sm sm:text-base"
        >
          {t("location")}
        </p>

        {/* Availability badge */}
        <p
          data-hero-line
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 py-1.5 pe-4 ps-3 text-sm font-medium text-emerald-600 backdrop-blur dark:text-emerald-300"
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {t("availability")}
        </p>

        {/* CTA row */}
        <div data-hero-line className="mt-10 flex flex-wrap items-center gap-3">
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
    </section>
  );
}
