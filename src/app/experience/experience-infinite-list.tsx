"use client";

import { useEffect, useMemo, useRef } from "react";
import { getCldImageUrl } from "next-cloudinary";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCursor } from "@/hooks/use-cursor";
import { formatMonthYear } from "@/lib/dates";
import { loadMorePublishedExperience } from "@/app/experience/list-actions";
import { ArrowPill, BezelLink } from "@/components/home/_shared";
import type {
  ExperiencePage,
  PublicExperienceCard,
} from "@/lib/db/queries/experience";

type Group = {
  companySlug: string;
  company: string;
  logoPublicId: string | null;
  companyUrl: string | null;
  roles: PublicExperienceCard[];
};

// Runs client-side after every fetch so promotions still stack even when
// they land across two pages.
function groupByCompany(rows: PublicExperienceCard[]): Group[] {
  const groups: Group[] = [];
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
  start: Date | string,
  end: Date | string | null,
  presentLabel: string,
): string {
  const s = start instanceof Date ? start : new Date(start);
  const e = end == null ? null : end instanceof Date ? end : new Date(end);
  return `${formatMonthYear(s)} to ${e ? formatMonthYear(e) : presentLabel}`;
}

export function ExperienceInfiniteList({
  initial,
}: {
  initial: ExperiencePage;
}) {
  const { items, hasMore, loading, error, loadMore } =
    useCursor<PublicExperienceCard>(initial, loadMorePublishedExperience);
  const t = useTranslations("experience");
  const workTypeLabels = useTranslations("experience.workTypes");
  const presentLabel = t("present");
  const groups = useMemo(() => groupByCompany(items), [items]);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "0px 0px 120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  if (groups.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--color-border)] p-12 text-center">
        <p className="text-muted-foreground text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <>
      <ol className="relative flex flex-col gap-16">
        <span
          aria-hidden
          className="absolute start-6 top-6 bottom-6 w-px bg-[var(--color-border)]"
        />
        {groups.map((group) => (
          <li key={group.companySlug} className="relative">
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
      <div ref={sentinel} aria-hidden className="h-1" />
      {loading ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          {t("loadingMore")}
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive py-6 text-center text-sm">
          {t("loadError")}
        </p>
      ) : null}
    </>
  );
}
