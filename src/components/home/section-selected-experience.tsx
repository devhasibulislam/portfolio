import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { formatMonthYear } from "@/lib/dates";
import { listLatestExperience } from "@/lib/db/queries/experience";
import { CompanyChip } from "@/components/company-chip";
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
  return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : presentLabel}`;
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
                <CompanyChip name={r.company} logoPublicId={r.logoPublicId} />
                {r.workType ? (
                  <span className="rounded-full border border-[var(--color-border)] px-3 py-0.5 text-xs text-[var(--color-fg)]/70">
                    {tWork(r.workType)}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-balance sm:text-2xl">
                {r.role}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {formatPeriod(r.periodStart, r.periodEnd, presentLabel)}
                {r.location ? ` · ${r.location}` : ""}
              </p>
              <p className="text-muted-foreground mt-4 line-clamp-3 text-base leading-relaxed">
                {r.summary}
              </p>
              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="text-sm text-[var(--color-fg)]/60 transition-colors group-hover:text-[var(--color-accent)]">
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
