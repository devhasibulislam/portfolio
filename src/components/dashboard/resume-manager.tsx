"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, ExternalLink, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { useAction } from "@/hooks/use-action";
import type { ResumeRow } from "@/lib/db/queries/resumes";
import {
  deleteResume,
  registerResume,
  setActiveResume,
} from "@/app/dashboard/resume/actions";

export function ResumeManager({ rows }: { rows: ResumeRow[] }) {
  const router = useRouter();
  const t = useTranslations("actions.resume");
  const [confirmDelete, setConfirmDelete] = useState<ResumeRow | null>(null);
  const [uploading, startUpload] = useTransition();
  const activate = useAction(setActiveResume);
  const del = useAction(deleteResume);
  const pending = uploading || activate.pending || del.pending;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const MAX_BYTES = 5_242_880; // 5MB

  const uploadPdf = (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error(
        t("fileTooLarge", {
          size: (file.size / 1024 / 1024).toFixed(2),
          max: MAX_BYTES / 1024 / 1024,
        }),
      );
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      toast.error(t("pdfOnly"));
      return;
    }

    startUpload(async () => {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = "portfolio/resume";
        const paramsToSign = { folder, timestamp };
        const signRes = await fetch("/api/sign-cloudinary-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paramsToSign }),
        });
        if (!signRes.ok) throw new Error("Signing failed");
        const { signature } = (await signRes.json()) as { signature: string };

        // Resumes are `resource_type: raw` on Cloudinary — the endpoint
        // segment changes accordingly.
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", apiKey!);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
          { method: "POST", body: form },
        );
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(
            (err as { error?: { message?: string } })?.error?.message ??
              "Cloudinary upload failed",
          );
        }
        const info = (await uploadRes.json()) as {
          public_id: string;
          secure_url: string;
          original_filename?: string;
          bytes: number;
        };

        const fd = new FormData();
        fd.set("publicId", info.public_id);
        fd.set("url", info.secure_url);
        fd.set("originalName", info.original_filename ?? info.public_id);
        fd.set("bytes", String(info.bytes));
        const reg = await registerResume(null, fd);
        if (reg?.error) {
          toast.error(reg.error);
          return;
        }
        toast.success(t("uploaded"));
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("uploadFailed"));
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <PageHeader
        title="Resume"
        description={
          <>
            Upload a new PDF; pick the one served at <code>/resume</code>.
          </>
        }
        className="mb-6"
        action={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadPdf(file);
                e.target.value = "";
              }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={pending}
            >
              <Upload className="me-1 size-4" />
              {pending ? "Uploading…" : "Upload PDF"}
            </Button>
          </>
        }
      />

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
                  <span className="truncate font-medium">{r.originalName}</span>
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
                          activate.run(fd, {
                            successToast: t("activated", {
                              name: r.originalName,
                            }),
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
                    {r.isActive ? "This is the active resume" : "Set as active"}
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

      <ConfirmDeleteDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title={<>Delete &quot;{confirmDelete?.originalName}&quot;?</>}
        description={
          confirmDelete?.isActive
            ? "This is the active resume. Deleting it leaves /resume with nothing to serve until you activate another one. It also removes the file from Cloudinary. This can't be undone."
            : "Removes the file from Cloudinary and this list. This can't be undone."
        }
        pending={pending}
        destructive
        onConfirm={() => {
          if (!confirmDelete) return;
          const fd = new FormData();
          fd.set("id", confirmDelete.id);
          del.run(fd, {
            successToast: t("deleted"),
            onOk: () => setConfirmDelete(null),
          });
        }}
      />
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1_048_576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_048_576).toFixed(1)} MB`;
}
