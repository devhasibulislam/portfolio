import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./scroll-reveal";
import { Spotlight } from "./spotlight";
import { SectionHeader, bezelInner, bezelOuter } from "./_shared";

/**
 * Languages Hasibul speaks. Config-driven (from the resume) — not tied to
 * the site's i18n locales. Native/professional levels come from the
 * resume header verbatim.
 */
const LANGUAGES = [
  { key: "bn", level: "native" },
  { key: "en", level: "professional" },
  { key: "hi", level: "working" },
  { key: "he", level: "elementary" },
  { key: "ar", level: "elementary" },
] as const;

type LangKey = (typeof LANGUAGES)[number]["key"];
type LangLevel = (typeof LANGUAGES)[number]["level"];

export async function SectionLanguages() {
  const [t, tLangs, tLevels] = await Promise.all([
    getTranslations("home.languages"),
    getTranslations("home.languages.names"),
    getTranslations("home.languages.levels"),
  ]);

  return (
    <section
      aria-labelledby="languages-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        id="languages-title"
      />
      <ScrollReveal
        as="ul"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        stagger={0.06}
      >
        {LANGUAGES.map((l) => (
          <li key={l.key} data-reveal>
            <Spotlight>
              <div className={cn(bezelOuter)}>
                <div className={cn(bezelInner, "px-5 py-6 text-center")}>
                  <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                    {tLangs(l.key as LangKey)}
                  </p>
                  <p className="text-muted-foreground mt-3 font-mono text-[10px] uppercase tracking-[0.18em]">
                    {tLevels(l.level as LangLevel)}
                  </p>
                </div>
              </div>
            </Spotlight>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
