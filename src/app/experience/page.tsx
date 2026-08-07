import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getCldImageUrl } from "next-cloudinary";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { formatMonthYear } from "@/lib/dates";
import {
  listPublishedExperience,
  type PublicExperienceCard,
} from "@/lib/db/queries/experience";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { ArrowPill, BezelLink } from "@/components/home/_shared";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.experience");
  const title = m("title");
  const description = m("description");
  return {
    title,
    description,
    alternates: { canonical: "/experience" },
    openGraph: {
      type: "website",
      title: `${title} · Hasibul Islam`,
      description,
      url: `${SITE_URL}/experience`,
    },
  };
}

async function loadRoles() {
  "use cache";
  cacheTag(tag.experiences());
  return listPublishedExperience();
}

/**
 * Group consecutive rows sharing a companySlug so a promotion at the
 * same company renders as one card with multiple role periods. The query
 * already sorts by (periodEnd nulls first, periodStart desc) so within a
 * company block the most recent role sits on top.
 */
function groupByCompany(rows: PublicExperienceCard[]): {
  companySlug: string;
  company: string;
  logoPublicId: string | null;
  companyUrl: string | null;
  roles: PublicExperienceCard[];
}[] {
  const groups: ReturnType<typeof groupByCompany> = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.companySlug === row.companySlug) {
      last.roles.push(row);
    } else {
      groups.push({
        companySlug: row.companySlug,
        company: row.company,
        logoPublicId: row.logoPublicId,
        companyUrl: row.companyUrl,
        roles: [row],
      });
    }
  }
  return groups;
}

function formatPeriod(
  start: Date,
  end: Date | null,
  presentLabel: string,
): string {
  return `${formatMonthYear(start)} to ${end ? formatMonthYear(end) : presentLabel}`;
}

export default async function ExperiencePage() {
  const [rows, t, workTypeLabels] = await Promise.all([
    loadRoles(),
    getTranslations("experience"),
    getTranslations("experience.workTypes"),
  ]);
  const groups = groupByCompany(rows);
  const presentLabel = t("present");

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-24 pb-24">
      <PageBreadcrumb trail={[{ label: t("heading") }]} />
      <header className="mb-16 max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {t("hero")}
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        </div>
      ) : (
        <ol className="relative flex flex-col gap-16">
          {/* One continuous rail runs the full column so company + role dots
              sit on the same vertical line. */}
          <span
            aria-hidden
            className="absolute start-6 top-6 bottom-6 w-px bg-[var(--color-border)]"
          />
          {groups.map((group) => (
            <li key={group.companySlug} className="relative">
              {/* Company row */}
              <div className="relative flex items-center gap-4 ps-16">
                <span
                  aria-hidden
                  className="absolute start-[calc(1.5rem-6px)] top-1/2 size-3 -translate-y-1/2 rounded-full bg-[var(--color-accent)] ring-4 ring-[var(--color-bg)]"
                />
                {group.logoPublicId ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getCldImageUrl({
                      src: group.logoPublicId,
                      width: 96,
                      height: 96,
                    })}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--color-accent)]/10"
                  >
                    <span className="text-sm font-semibold text-[var(--color-accent)]">
                      {group.company.slice(0, 1)}
                    </span>
                  </div>
                )}
                <h2 className="min-w-0 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                  {group.companyUrl ? (
                    <a
                      href={group.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--color-accent)] inline-flex items-center gap-2 transition-colors"
                    >
                      {group.company}
                      <ArrowUpRight className="size-4 opacity-60" />
                    </a>
                  ) : (
                    group.company
                  )}
                </h2>
              </div>

              {/* Roles — dots sit on the same shared rail as the company. */}
              <ul className="mt-6 flex flex-col gap-4">
                {group.roles.map((role) => (
                  <li key={role.id} className="relative ps-16">
                    <span
                      aria-hidden
                      className="absolute start-[calc(1.5rem-5px)] top-7 size-2.5 rounded-full bg-[var(--color-bg)] ring-2 ring-[var(--color-border)]"
                    />
                    <BezelLink
                      href={`/experience/${role.slug}`}
                      className="overflow-hidden"
                      plain
                    >
                      <article className="flex items-start justify-between gap-5 p-6 sm:p-7">
                        <div className="min-w-0 flex-1">
                          <p className="text-[var(--color-accent)]/90 text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums">
                            {formatPeriod(
                              role.periodStart,
                              role.periodEnd,
                              presentLabel,
                            )}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-[var(--color-accent)] sm:text-[1.375rem]">
                            {role.role}
                          </h3>
                          {role.location || role.workType ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {role.location ? (
                                <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-2.5 py-1 text-xs text-[var(--color-fg)]/70">
                                  {role.location}
                                </span>
                              ) : null}
                              {role.workType ? (
                                <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-2.5 py-1 text-xs text-[var(--color-fg)]/70">
                                  {workTypeLabels(role.workType)}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          <p className="text-muted-foreground mt-4 line-clamp-2 text-sm leading-relaxed sm:text-base">
                            {role.summary}
                          </p>
                        </div>
                        <div className="mt-1 shrink-0">
                          <ArrowPill size={7} />
                        </div>
                      </article>
                    </BezelLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
