import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listLatestExperience } from "@/lib/db/queries/experience";
import { ScrollReveal } from "./scroll-reveal";
import { ArrowPill, BezelLink, SectionHeader, SeeAllLink } from "./_shared";

async function loadLatest() {
  "use cache";
  cacheTag(tag.experiences());
  return listLatestExperience(4);
}

function formatPeriod(
  start: Date,
  end: Date | null,
  presentLabel: string,
): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  return `${fmt(start)} — ${end ? fmt(end) : presentLabel}`;
}

export async function SectionSelectedExperience() {
  const [rows, t, tExp, tWork] = await Promise.all([
    loadLatest(),
    getTranslations("home.selectedExperience"),
    getTranslations("experience"),
    getTranslations("experience.workTypes"),
  ]);

  if (rows.length === 0) return null;

  const presentLabel = tExp("present");

  return (
    <section
      aria-labelledby="selected-experience-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        id="selected-experience-title"
        action={<SeeAllLink href="/experience" label={t("seeAll")} />}
      />
      <ScrollReveal
        as="ul"
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
        stagger={0.1}
      >
        {rows.map((r) => (
          <li key={r.id} data-reveal>
            <BezelLink
              href={`/experience/${r.slug}`}
              innerClassName="p-7 flex-1"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  {r.company}
                </p>
                {r.workType ? (
                  <span className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-fg)]/70">
                    {tWork(r.workType)}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                {r.role}
              </h3>
              <p className="text-muted-foreground mt-2 font-mono text-xs uppercase tracking-[0.14em]">
                {formatPeriod(r.periodStart, r.periodEnd, presentLabel)}
                {r.location ? ` · ${r.location}` : ""}
              </p>
              <p className="text-muted-foreground mt-4 line-clamp-3 text-sm leading-relaxed">
                {r.summary}
              </p>
              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg)]/60 transition-colors group-hover:text-[var(--color-accent)]">
                  {t("cta")}
                </span>
                <ArrowPill size={7} />
              </div>
            </BezelLink>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
