import { getTranslations } from "next-intl/server";
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

export async function SectionTrackRecord() {
  const t = await getTranslations("home.trackRecord");

  return (
    <section
      aria-labelledby="track-record-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <ScrollReveal className="mb-14 max-w-2xl" stagger={0.08}>
        <p
          data-reveal
          className="text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-[0.28em]"
        >
          {t("eyebrow")}
        </p>
        <h2
          data-reveal
          id="track-record-title"
          className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
        >
          {t("title")}
        </h2>
      </ScrollReveal>

      <ScrollReveal
        as="ul"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] bg-[var(--color-border)] p-px ring-1 ring-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.08}
      >
        {STATS.map((k) => (
          <li
            key={k}
            data-reveal
            className="relative flex flex-col justify-between gap-8 bg-[var(--card)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-10"
          >
            <p className="font-mono text-5xl font-semibold leading-none tracking-tighter text-[var(--color-fg)] sm:text-6xl md:text-7xl">
              <CountUp value={t(`${k}.value`)} />
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              {t(`${k}.label`)}
            </p>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
