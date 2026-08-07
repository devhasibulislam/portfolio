import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";
import { CountUp } from "./count-up";

/**
 * Track record strip — four hardcoded numbers that anchor the "senior
 * with receipts" claim. The `2 SaaS products acquired · NDA · contract
 * on request` stat is the load-bearing one; place it dead center so eyes
 * land there. Values count up from zero on first viewport entry.
 */

type StatKey = "years" | "countries" | "exits" | "remote";
const STATS: StatKey[] = ["years", "countries", "exits", "remote"];
const COUNTRY_CODES = ["IL", "IT", "DZ", "SA", "BD", "PK"] as const;

export async function SectionTrackRecord() {
  const [t, locale] = await Promise.all([
    getTranslations("home.trackRecord"),
    getLocale(),
  ]);
  const regionNames = new Intl.DisplayNames([locale], { type: "region" });

  return (
    <section
      aria-labelledby="track-record-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <ScrollReveal className="mb-14 max-w-2xl" stagger={0.08}>
        <h2
          data-reveal
          id="track-record-title"
          className="text-3xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-[3.25rem]"
        >
          {t("title")}
        </h2>
      </ScrollReveal>

      <ScrollReveal
        as="ul"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.08}
      >
        {STATS.map((k) => (
          <li
            key={k}
            data-reveal
            className="relative flex flex-col justify-between gap-8 bg-[var(--card)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-10"
          >
            <p className="text-5xl font-semibold leading-none tracking-tight tabular-nums text-[var(--color-fg)] sm:text-6xl md:text-7xl">
              <CountUp value={t(`${k}.value`)} />
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              {k === "countries" ? (
                <>
                  {t(`${k}.label`)}:{" "}
                  {COUNTRY_CODES.map((code, i) => (
                    <span key={code}>
                      {i > 0 ? " · " : null}
                      <abbr
                        title={regionNames.of(code) ?? code}
                        className="cursor-help no-underline decoration-dotted underline-offset-4 hover:underline"
                      >
                        {code}
                      </abbr>
                    </span>
                  ))}
                </>
              ) : (
                t(`${k}.label`)
              )}
            </p>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
