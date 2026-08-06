import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NAV_GROUPS } from "@/components/dashboard/nav";
import { NeonAnalyticsCard } from "@/components/dashboard/neon-analytics-card";
import { VercelAnalyticsCard } from "@/components/dashboard/vercel-analytics-card";
import { Card } from "@/components/ui/card";
import { getNeonAnalytics } from "@/lib/neon-api";
import { getVercelAnalytics } from "@/lib/vercel-api";
import { getOverviewCounts } from "@/lib/db/queries/overview";

const COUNT_KEY: Record<
  string,
  keyof Awaited<ReturnType<typeof getOverviewCounts>>
> = {
  "/dashboard/posts": "posts",
  "/dashboard/projects": "projects",
  "/dashboard/experience": "experience",
  "/dashboard/skills": "skills",
  "/dashboard/categories": "categories",
  "/dashboard/tags": "tags",
  "/dashboard/media": "media",
  "/dashboard/resume": "resume",
};

const pad = (n: number) => n.toString().padStart(2, "0");

export default async function DashboardPage() {
  // Content counts and infra analytics resolve in parallel — the Neon and
  // Vercel calls sit inside `"use cache"` boundaries so free-tier quotas
  // stay quiet between refreshes.
  const [counts, neon, vercel, t] = await Promise.all([
    getOverviewCounts(),
    getNeonAnalytics(),
    getVercelAnalytics(),
    getTranslations("dashboard"),
  ]);
  // Skip the "Overview" group on the Overview page itself (it would just
  // link back here). Render one section per remaining nav group.
  const sections = NAV_GROUPS.filter((g) => g.key !== "overview");
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("overview.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("overview.subtitle")}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
          {t("overview.infrastructure")}
        </h2>
        <div className="flex flex-col gap-4">
          <VercelAnalyticsCard data={vercel} />
          <NeonAnalyticsCard data={neon} />
        </div>
      </section>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.key}>
            <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
              {t(`nav.groups.${section.key}`)}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map(({ key, href, icon: Icon }) => {
                const countKey = COUNT_KEY[href];
                const n = countKey ? counts[countKey] : 0;
                return (
                  <Link key={href} href={href} className="group">
                    <Card className="hover:border-primary/50 group-focus-visible:ring-ring flex h-full flex-row items-start gap-3 p-4 transition-colors group-focus-visible:ring-2">
                      <div className="bg-primary/10 text-primary rounded-md p-2">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base leading-none font-semibold">
                          {t(`nav.items.${key}`)}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {t(`nav.descriptions.${key}`)}
                        </p>
                      </div>
                      <span className="text-muted-foreground group-hover:text-primary group-hover:border-primary/40 rounded-md border px-2 py-0.5 font-mono text-sm tabular-nums transition-colors">
                        {pad(n)}
                      </span>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
