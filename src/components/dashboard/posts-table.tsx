"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import type { PostRow } from "@/lib/db/queries/posts";
import { deletePost, togglePostStatus } from "@/app/dashboard/posts/actions";

export function PostsTable({ rows }: { rows: PostRow[] }) {
  const router = useRouter();
  const t = useTranslations("actions.posts");
  const [confirmDelete, setConfirmDelete] = useState<PostRow | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Updated</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground py-8 text-center"
              >
                No posts yet. Click <strong>New post</strong>.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.id} className="cursor-pointer">
                <TableCell className="max-w-0 md:max-w-none">
                  <Link
                    href={`/dashboard/posts/${r.id}/edit`}
                    className="hover:text-primary block font-medium"
                  >
                    <span className="block truncate md:whitespace-normal">
                      {r.title}
                    </span>
                    <span className="text-muted-foreground mt-0.5 block truncate font-mono text-xs md:whitespace-normal">
                      /{r.slug}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                  {r.categoryName ?? "-"}
                </TableCell>
                <TableCell>
                  <StatusSwitch row={r} />
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm md:table-cell">
                  {formatRelative(r.updatedAt)}
                </TableCell>
                <TableCell className="text-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${r.title}`}
                    onClick={() => setConfirmDelete(r)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ConfirmDeleteDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title={<>Delete &quot;{confirmDelete?.title}&quot;?</>}
        description="This deletes the post and its tag links. Cover image stays in the media library."
        pending={pending}
        destructive
        onConfirm={() => {
          if (!confirmDelete) return;
          const fd = new FormData();
          fd.set("id", confirmDelete.id);
          startTransition(async () => {
            const res = await deletePost(null, fd);
            if (res?.error) {
              toast.error(res.error);
              return;
            }
            toast.success(t("deleted"));
            setConfirmDelete(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}

function StatusPill({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
      <span className="size-1.5 rounded-full bg-current" />
      Published
    </span>
  ) : (
    <span className="text-muted-foreground bg-muted inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs">
      <span className="size-1.5 rounded-full bg-current" />
      Draft
    </span>
  );
}

/**
 * Row-level status Switch. Optimistic toggle via `useOptimistic` so the UI
 * flips instantly; if the server action returns an error we bounce back.
 */
function StatusSwitch({ row }: { row: PostRow }) {
  const router = useRouter();
  const t = useTranslations("actions.posts");
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(row.status);
  const [pending, startTransition] = useTransition();
  const isPublished = optimisticStatus === "published";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-2">
          <Switch
            checked={isPublished}
            disabled={pending}
            onCheckedChange={(checked) => {
              const next = checked ? "published" : "draft";
              startTransition(async () => {
                setOptimisticStatus(next);
                const fd = new FormData();
                fd.set("id", row.id);
                fd.set("status", next);
                const res = await togglePostStatus(null, fd);
                if (res?.error) {
                  toast.error(res.error);
                  return;
                }
                toast.success(
                  next === "published"
                    ? t("publishedToast")
                    : t("draftedToast"),
                );
                router.refresh();
              });
            }}
            aria-label={isPublished ? "Move to draft" : "Publish this post"}
          />
          <StatusPill status={optimisticStatus} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {isPublished ? "Move to draft" : "Publish this post"}
      </TooltipContent>
    </Tooltip>
  );
}

function formatRelative(d: Date): string {
  const now = Date.now();
  const t = new Date(d).getTime();
  const diffMs = now - t;
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(d).toLocaleDateString();
}
