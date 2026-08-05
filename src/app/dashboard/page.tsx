import Link from "next/link";
import { NAV_GROUPS } from "@/components/dashboard/nav";
import { NeonAnalyticsCard } from "@/components/dashboard/neon-analytics-card";
import { Card } from "@/components/ui/card";
import { getNeonAnalytics } from "@/lib/neon-api";
import { getOverviewCounts } from "@/lib/db/queries/overview";

const DESCRIPTIONS: Record<string, string> = {
  "/dashboard/posts": "Write and publish blog posts.",
  "/dashboard/projects": "Client engagements, products, OSS references.",
  "/dashboard/experience": "Roles + bullet-point highlights per company.",
  "/dashboard/skills": "Grouped stack list surfaced across the site.",
  "/dashboard/categories": "One category per post.",
  "/dashboard/tags": "Group posts by topic (max 8 per post).",
  "/dashboard/media": "Cloudinary uploads reused across posts.",
  "/dashboard/resume": "One active PDF served at /resume.",
};

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
  // Content counts and Neon analytics resolve in parallel — the Neon call
  // sits inside a `"use cache"` boundary so free-tier compute stays quiet
  // between refreshes.
  const [counts, neon] = await Promise.all([
    getOverviewCounts(),
    getNeonAnalytics(),
  ]);
  // Skip the "Overview" group on the Overview page itself (it would just
  // link back here). Render one section per remaining nav group.
  const sections = NAV_GROUPS.filter((g) => g.label !== "Overview");
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Content lives here. The public site reads from what you save.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
          Infrastructure
        </h2>
        <NeonAnalyticsCard data={neon} />
      </section>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.label}>
            <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
              {section.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map(({ label, href, icon: Icon }) => {
                const key = COUNT_KEY[href];
                const n = key ? counts[key] : 0;
                return (
                  <Link key={href} href={href} className="group">
                    <Card className="hover:border-primary/50 group-focus-visible:ring-ring flex h-full flex-row items-start gap-3 p-4 transition-colors group-focus-visible:ring-2">
                      <div className="bg-primary/10 text-primary rounded-md p-2">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base leading-none font-semibold">
                          {label}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {DESCRIPTIONS[href] ?? ""}
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
