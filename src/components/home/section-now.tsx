import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { CtaButton } from "@/components/cta-button";
import { CompanyChip } from "@/components/company-chip";
import { tag } from "@/lib/cache-tags";
import { listLatestExperience } from "@/lib/db/queries/experience";
import { ScrollReveal } from "./scroll-reveal";
import { Spotlight } from "./spotlight";
import { bezelInner, bezelOuter } from "./_shared";

async function loadCurrentRole() {
  "use cache";
  cacheTag(tag.experiences());
  const rows = await listLatestExperience(1);
  return rows[0] ?? null;
}

export async function SectionNow() {
  const [t, role] = await Promise.all([
    getTranslations("home.now"),
    loadCurrentRole(),
  ]);

  return (
    <section
      aria-labelledby="now-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-14 sm:py-16"
    >
      <ScrollReveal className="h-full" stagger={0.08}>
        <Spotlight>
          <div className={cn("relative overflow-hidden", bezelOuter)}>
            <div
              className={cn(
                "relative px-8 py-10 sm:px-12 sm:py-14",
                bezelInner,
              )}
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

              {role ? (
                <div data-reveal className="mt-5">
                  <CompanyChip
                    name={role.company}
                    logoPublicId={role.logoPublicId}
                    size="md"
                  />
                </div>
              ) : null}

              <p
                data-reveal
                className="text-muted-foreground mt-4 max-w-3xl text-base leading-relaxed sm:text-lg"
              >
                {t("body")}
              </p>

              <div data-reveal className="mt-8">
                <CtaButton href="/experience">{t("cta")}</CtaButton>
              </div>
            </div>
          </div>
        </Spotlight>
      </ScrollReveal>
    </section>
  );
}
