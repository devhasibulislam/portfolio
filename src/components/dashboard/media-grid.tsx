"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { MediaRow } from "@/lib/db/queries/media";
import { deleteMedia, registerMedia } from "@/app/dashboard/media/actions";

type Filter = "all" | "in-use" | "unused";

export function MediaGrid({ rows }: { rows: MediaRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmDelete, setConfirmDelete] = useState<MediaRow | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "in-use") return rows.filter((r) => r.inUse);
    return rows.filter((r) => !r.inUse);
  }, [rows, filter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
          <p className="text-muted-foreground text-sm">
            Post covers. 1MB max, cropped to 1.91:1 (1200×630) on delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FilterTabs value={filter} onChange={setFilter} />
          <CldUploadWidget
            signatureEndpoint="/api/sign-cloudinary-params"
            options={{
              sources: ["local", "url"],
              multiple: false,
              maxFiles: 1,
              maxFileSize: 1_048_576, // 1MB
              folder: "portfolio/posts",
              clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
            }}
            onSuccess={(result: CloudinaryUploadWidgetResults) => {
              const info = result.info;
              if (typeof info !== "object" || info === null || !("public_id" in info)) {
                return;
              }
              const fd = new FormData();
              fd.set("publicId", String(info.public_id));
              fd.set("url", String((info as { secure_url: string }).secure_url));
              fd.set(
                "originalName",
                String((info as { original_filename?: string }).original_filename ?? info.public_id),
              );
              fd.set("width", String((info as { width: number }).width));
              fd.set("height", String((info as { height: number }).height));
              fd.set("bytes", String((info as { bytes: number }).bytes));
              fd.set("format", String((info as { format: string }).format));
              fd.set("folder", "portfolio/posts");
              startTransition(async () => {
                const res = await registerMedia(null, fd);
                if (res?.error) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Uploaded");
                router.refresh();
              });
            }}
            onError={(err) => {
              toast.error(
                typeof err === "string" ? err : (err?.statusText ?? "Upload failed"),
              );
            }}
          >
            {({ open }) => (
              <Button onClick={() => open()} disabled={pending}>
                <Upload className="me-1 size-4" />
                Upload
              </Button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border py-16 text-center">
          {rows.length === 0
            ? "No media yet. Click Upload."
            : "Nothing matches this filter."}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <li key={m.id} className="group relative">
              <div className="bg-muted relative overflow-hidden rounded-lg border">
                <CldImage
                  src={m.publicId}
                  width={400}
                  height={210}
                  crop="fill"
                  gravity="auto"
                  alt={m.originalName}
                  className="h-auto w-full"
                />
                {m.inUse ? (
                  <span className="bg-primary text-primary-foreground absolute start-2 top-2 rounded-md px-2 py-0.5 text-xs font-medium">
                    In use
                  </span>
                ) : null}
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label={`Delete ${m.originalName}`}
                  className="absolute end-2 top-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() => setConfirmDelete(m)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
                <span className="text-foreground truncate" title={m.originalName}>
                  {m.originalName}
                </span>
                <span className="text-muted-foreground tabular-nums whitespace-nowrap">
                  {formatBytes(m.bytes)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DeleteDialog
        row={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      />
    </div>
  );
}

function FilterTabs({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (v: Filter) => void;
}) {
  const items: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "in-use", label: "In use" },
    { value: "unused", label: "Unused" },
  ];
  return (
    <div
      role="tablist"
      className="bg-muted inline-flex rounded-md p-0.5 text-sm"
    >
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onChange(it.value)}
          className={`rounded-sm px-3 py-1 transition-colors ${
            value === it.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function DeleteDialog({
  row,
  onOpenChange,
}: {
  row: MediaRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!row) return null;
  return (
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{row.originalName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {row.inUse
              ? "Blocked: this image is set as a post cover. Reassign it first."
              : "Removes the file from Cloudinary and this list. Can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || row.inUse}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.set("id", row.id);
              startTransition(async () => {
                const res = await deleteMedia(null, fd);
                if (res?.error) {
                  toast.error(res.error);
                  return;
                }
                toast.success("Deleted");
                onOpenChange(false);
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1_048_576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_048_576).toFixed(1)} MB`;
}
