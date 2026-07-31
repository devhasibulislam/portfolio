import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV } from "@/components/dashboard/nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const DESCRIPTIONS: Record<string, string> = {
  "/dashboard/posts": "Write and publish blog posts.",
  "/dashboard/categories": "One category per post.",
  "/dashboard/tags": "Group posts by topic (max 8 per post).",
  "/dashboard/media": "Cloudinary uploads reused across posts.",
  "/dashboard/resume": "One active PDF served at /resume.",
  "/dashboard/links": "Small Linktree-style rows.",
};

export default function DashboardPage() {
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
        {tiles.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="hover:border-primary/50 h-full transition-colors">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription className="mt-1">
                    {DESCRIPTIONS[href] ?? ""}
                  </CardDescription>
                </div>
                <ArrowRight className="text-muted-foreground group-hover:text-primary mt-1 size-4 transition-colors rtl:rotate-180" />
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
