import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PostsTable } from "@/components/dashboard/posts-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { listPosts } from "@/lib/db/queries/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.pages.posts");
  return { title: t("title") };
}

export default async function Page() {
  const [rows, t] = await Promise.all([
    listPosts(),
    getTranslations("dashboard.pages.posts"),
  ]);
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus className="me-1 size-4" />
              {t("newButton")}
            </Link>
          </Button>
        }
      />
      <PostsTable rows={rows} />
    </div>
  );
}
