import type { Metadata } from "next";
import Link from "next/link";
import { cacheTag } from "next/cache";
import { getCldImageUrl } from "next-cloudinary";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import {
  listPublishedExperience,
  type PublicExperienceCard,
} from "@/lib/db/queries/experience";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

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
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  return `${fmt(start)} to ${end ? fmt(end) : presentLabel}`;
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
      <header className="mb-14 max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {t("hero")}
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-10">
          {groups.map((group) => (
            <li
              key={group.companySlug}
              className="border-s-2 border-[var(--color-border)] ps-6"
            >
              {/* Company header */}
              <div className="flex items-start gap-3">
                {group.logoPublicId ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getCldImageUrl({
                      src: group.logoPublicId,
                      width: 80,
                      height: 80,
                    })}
                    alt=""
                    width={40}
                    height={40}
                    className="mt-1 h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-md bg-[var(--color-accent)]/10" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                    {group.companyUrl ? (
                      <a
                        href={group.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--color-accent-strong)] inline-flex items-center gap-1.5 transition-colors"
                      >
                        {group.company}
                        <ArrowUpRight className="size-4 opacity-60" />
                      </a>
                    ) : (
                      group.company
                    )}
                  </h2>
                </div>
              </div>

              {/* Roles at this company */}
              <ul className="mt-4 flex flex-col gap-4">
                {group.roles.map((role) => (
                  <li key={role.id}>
                    <Link
                      href={`/experience/${role.slug}`}
                      className="group block rounded-md border border-transparent bg-[var(--color-bg)]/40 p-4 transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-[var(--color-accent-strong)]">
                          {role.role}
                        </h3>
                        <p className="text-muted-foreground text-xs tabular-nums">
                          {formatPeriod(
                            role.periodStart,
                            role.periodEnd,
                            presentLabel,
                          )}
                        </p>
                      </div>
                      {role.location || role.workType ? (
                        <p className="text-muted-foreground/80 mt-1 text-xs">
                          {[
                            role.location,
                            role.workType
                              ? workTypeLabels(role.workType)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                      <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
                        {role.summary}
                      </p>
                    </Link>
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
