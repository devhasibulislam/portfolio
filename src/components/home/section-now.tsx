import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./scroll-reveal";
import { Spotlight } from "./spotlight";
import { bezelInner, bezelOuter } from "./_shared";

export async function SectionNow() {
  const t = await getTranslations("home.now");

  return (
    <section
      aria-labelledby="now-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-14 sm:py-16"
    >
      <ScrollReveal className="h-full" stagger={0.08}>
        <Spotlight>
          <div className={cn("relative overflow-hidden", bezelOuter)}>
            <div
              className={cn("relative px-8 py-10 sm:px-12 sm:py-14", bezelInner)}
            >
          <div
            data-reveal
            className="flex items-center gap-3 text-[var(--color-accent)]"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-accent)] opacity-70" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[var(--color-accent)]" />
            </span>
            <span className="text-sm font-medium">{t("eyebrow")}</span>
          </div>

          <h2
            data-reveal
            id="now-title"
            className="mt-5 max-w-4xl text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl md:text-4xl"
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
                className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
              >
                {t("cta")}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            </div>
          </div>
        </Spotlight>
      </ScrollReveal>
    </section>
  );
}
