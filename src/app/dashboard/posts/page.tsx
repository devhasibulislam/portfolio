import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostsTable } from "@/components/dashboard/posts-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { listPosts } from "@/lib/db/queries/posts";

export const metadata = { title: "Posts" };

export default async function Page() {
  const rows = await listPosts();
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        title="Posts"
        description="Drafts stay hidden. Published shows on the public blog."
        action={
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus className="me-1 size-4" />
              New post
            </Link>
          </Button>
        }
      />
      <PostsTable rows={rows} />
    </div>
  );
}
