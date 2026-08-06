import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostsTable } from "@/components/dashboard/posts-table";
import { listPosts } from "@/lib/db/queries/posts";

export const metadata = { title: "Posts" };

export default async function Page() {
  const rows = await listPosts();
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <Plus className="me-1 size-4" />
              New post
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Drafts stay hidden. Published shows on the public blog.
        </p>
      </div>
      <PostsTable rows={rows} />
    </div>
  );
}
