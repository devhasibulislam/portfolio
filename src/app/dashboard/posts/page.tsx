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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-muted-foreground text-sm">
            Drafts stay hidden. Published shows on the public blog.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">
            <Plus className="me-1 size-4" />
            New post
          </Link>
        </Button>
      </div>
      <PostsTable rows={rows} />
    </div>
  );
}
