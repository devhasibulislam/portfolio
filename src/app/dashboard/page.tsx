import Link from "next/link";
import { NAV } from "@/components/dashboard/nav";
import { Card } from "@/components/ui/card";
import { getOverviewCounts } from "@/lib/db/queries/overview";

export const dynamic = "force-dynamic";

const DESCRIPTIONS: Record<string, string> = {
  "/dashboard/posts": "Write and publish blog posts.",
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
  "/dashboard/categories": "categories",
  "/dashboard/tags": "tags",
  "/dashboard/media": "media",
  "/dashboard/resume": "resume",
};

const pad = (n: number) => n.toString().padStart(2, "0");

export default async function DashboardPage() {
  const counts = await getOverviewCounts();
  const tiles = NAV.filter((n) => n.href !== "/dashboard");
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Content lives here. The public site reads from what you save.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ label, href, icon: Icon }) => {
          const key = COUNT_KEY[href];
          const n = key ? counts[key] : 0;
          return (
            <Link key={href} href={href} className="group">
              <Card className="hover:border-primary/50 group-focus-visible:ring-ring flex h-full flex-row items-start gap-3 p-4 transition-colors group-focus-visible:ring-2">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base leading-none font-semibold">
                    {label}
                  </h2>
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
    </main>
  );
}
