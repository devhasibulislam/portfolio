"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { CheckCircle2, ExternalLink, Trash2, Upload } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ResumeRow } from "@/lib/db/queries/resumes";
import {
  deleteResume,
  registerResume,
  setActiveResume,
} from "@/app/dashboard/resume/actions";

export function ResumeManager({ rows }: { rows: ResumeRow[] }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState<ResumeRow | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
          <p className="text-muted-foreground text-sm">
            Upload a new PDF; pick the one served at <code>/resume</code>.
          </p>
        </div>
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          options={{
            sources: ["local"],
            resourceType: "raw",
            multiple: false,
            maxFiles: 1,
            folder: "portfolio/resume",
            clientAllowedFormats: ["pdf"],
            maxFileSize: 5_242_880, // 5MB — resumes are text, but keep some room
          }}
          onSuccess={(result: CloudinaryUploadWidgetResults) => {
            const info = result.info;
            if (
              typeof info !== "object" ||
              info === null ||
              !("public_id" in info)
            ) {
              return;
            }
            const fd = new FormData();
            fd.set("publicId", String(info.public_id));
            fd.set("url", String((info as { secure_url: string }).secure_url));
            fd.set(
              "originalName",
              String(
                (info as { original_filename?: string }).original_filename ??
                  info.public_id,
              ),
            );
            fd.set("bytes", String((info as { bytes: number }).bytes));
            startTransition(async () => {
              const res = await registerResume(null, fd);
              if (res?.error) {
                toast.error(res.error);
                return;
              }
              toast.success("Resume uploaded");
              router.refresh();
            });
          }}
          onError={(err) => {
            toast.error(
              typeof err === "string"
                ? err
                : (err?.statusText ?? "Upload failed"),
            );
          }}
        >
          {({ open }) => (
            <Button onClick={() => open()} disabled={pending}>
              <Upload className="me-1 size-4" />
              Upload PDF
            </Button>
          )}
        </CldUploadWidget>
      </div>

      {rows.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border py-16 text-center">
          No resumes yet. Click <strong>Upload PDF</strong>.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                r.isActive ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              {/* Filename + meta take the left / stretch column. */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate font-medium">
                    {r.originalName}
                  </span>
                  {r.isActive ? (
                    <span className="text-primary inline-flex shrink-0 items-center gap-1 text-xs">
                      <CheckCircle2 className="size-3.5" />
                      Active
                    </span>
                  ) : null}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatBytes(r.bytes)} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Actions cluster: Switch (activate) + Open + Delete. Grouped
                  on the trailing edge so their positions stay predictable as
                  more resumes are added. */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="me-1 inline-flex">
                      <Switch
                        checked={r.isActive}
                        disabled={pending || r.isActive}
                        onCheckedChange={() => {
                          if (r.isActive) return;
                          const fd = new FormData();
                          fd.set("id", r.id);
                          startTransition(async () => {
                            const res = await setActiveResume(null, fd);
                            if (res?.error) {
                              toast.error(res.error);
                              return;
                            }
                            toast.success(`Active: ${r.originalName}`);
                            router.refresh();
                          });
                        }}
                        aria-label={
                          r.isActive
                            ? `${r.originalName} is active`
                            : `Set ${r.originalName} active`
                        }
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {r.isActive
                      ? "This is the active resume"
                      : "Set as active"}
                  </TooltipContent>
                </Tooltip>
                <Button size="icon" variant="ghost" asChild>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${r.originalName}`}
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${r.originalName}`}
                  onClick={() => setConfirmDelete(r)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete “{confirmDelete?.originalName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.isActive
                ? "This is the active resume — deleting it leaves /resume with nothing to serve until you activate another one. Removes the file from Cloudinary too. Can’t be undone."
                : "Removes the file from Cloudinary and this list. Can’t be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (!confirmDelete) return;
                const fd = new FormData();
                fd.set("id", confirmDelete.id);
                startTransition(async () => {
                  const res = await deleteResume(null, fd);
                  if (res?.error) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("Resume deleted");
                  setConfirmDelete(null);
                  router.refresh();
                });
              }}
            >
              {pending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1_048_576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_048_576).toFixed(1)} MB`;
}
