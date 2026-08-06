"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CldImage } from "next-cloudinary";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCropper } from "@/components/dashboard/image-cropper";
import { registerMedia } from "@/app/dashboard/media/actions";

export type PickedMedia = {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  originalName: string;
};

type LibraryOption = {
  id: string;
  publicId: string;
  originalName: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: LibraryOption[];
  onSelect: (media: PickedMedia) => void;
  /**
   * Optional target aspect ratio for the OG cover hint. Only used in the
   * description string — the actual crop happens at delivery time
   * (`c_fill,g_auto` via CldImage) so we skip a client cropper.
   */
  aspect?: number;
  /**
   * Which folder to store new uploads under. Defaults to portfolio/posts —
   * shared by post covers and inline body images so they can reuse each
   * other.
   */
  folder?: string;
  /**
   * Client-side pre-check; the server also enforces this via the media Zod
   * schema. 1MB per §5.
   */
  maxFileSize?: number;
  /** File extensions accepted. Defaults to the §5 image set. */
  allowedFormats?: readonly string[];
};

/**
 * Reusable pick-or-upload modal. Two tabs:
 *   - Library: grid of media rows already in Cloudinary + our DB.
 *   - Upload:  native <input type="file"> → direct signed upload to
 *              Cloudinary. Bypasses `CldUploadWidget` because its iframe
 *              "Browse" button silently fails in strict browsers (Brave
 *              Shields, popup blockers, cross-origin file-picker rules).
 */
export function ImagePickerDialog({
  open,
  onOpenChange,
  options,
  onSelect,
  aspect,
  folder = "portfolio/posts",
  maxFileSize = 1_048_576,
  allowedFormats = ["jpg", "jpeg", "png", "gif", "webp"],
}: Props) {
  const t = useTranslations("dashboard.imagePicker");
  const [tab, setTab] = useState<"library" | "upload">(
    options.length > 0 ? "library" : "upload",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {allowedFormats.map((f) => f.toUpperCase()).join(", ")} ·{" "}
            {t("descMaxSize", { max: Math.round(maxFileSize / 1024 / 1024) })}
            {aspect
              ? ` · ${t("descRatio", { ratio: aspect.toFixed(2) })}`
              : ` · ${t("descAnyRatio")}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "library" | "upload")}
        >
          <TabsList>
            <TabsTrigger value="library" disabled={options.length === 0}>
              {t("tabLibrary")}
              {options.length > 0 ? (
                <span className="text-muted-foreground ms-2 tabular-nums">
                  {options.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="upload">{t("tabUpload")}</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="pt-2">
            {options.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {t("libraryEmpty")}
              </p>
            ) : (
              <ul className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pe-1 sm:grid-cols-3">
                {options.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() =>
                        onSelect({
                          id: m.id,
                          publicId: m.publicId,
                          url: "",
                          width: 0,
                          height: 0,
                          originalName: m.originalName,
                        })
                      }
                      className="focus-visible:ring-ring block w-full overflow-hidden rounded-md border transition-all hover:ring-2 focus-visible:ring-2"
                      aria-label={`Select ${m.originalName}`}
                    >
                      <CldImage
                        src={m.publicId}
                        width={320}
                        height={168}
                        crop="fill"
                        gravity="auto"
                        alt={m.originalName}
                        className="h-auto w-full"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="upload" className="pt-2">
            <UploadTab
              folder={folder}
              maxFileSize={maxFileSize}
              allowedFormats={allowedFormats}
              aspect={aspect}
              onUploaded={onSelect}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------- upload tab body ---------------------------- */

function UploadTab({
  folder,
  maxFileSize,
  allowedFormats,
  aspect,
  onUploaded,
}: {
  folder: string;
  maxFileSize: number;
  allowedFormats: readonly string[];
  aspect?: number;
  onUploaded: (media: PickedMedia) => void;
}) {
  const router = useRouter();
  const t = useTranslations("actions.media");
  const tPicker = useTranslations("dashboard.imagePicker");
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  // Two-step flow: pick a file → crop it → upload. `stagedFile` is the
  // original the user picked; the crop step is skipped if it's not an
  // image mime we can rasterize (GIFs preserve animation this way).
  const [stagedFile, setStagedFile] = useState<File | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  const handleFile = (file: File) => {
    if (file.size > maxFileSize) {
      toast.error(
        t("fileTooLarge", {
          size: (file.size / 1024 / 1024).toFixed(2),
          max: Math.round(maxFileSize / 1024 / 1024),
        }),
      );
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedFormats.includes(ext)) {
      toast.error(t("unsupportedType"));
      return;
    }
    // GIF preserves animation only if we skip canvas rasterization.
    if (ext === "gif") {
      uploadBlob(file, file.name);
      return;
    }
    // Everything else goes through the cropper first.
    setStagedFile(file);
  };

  const uploadBlob = (blob: Blob, originalName: string) => {
    startTransition(async () => {
      try {
        // 1. Ask our server to sign the params.
        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = { folder, timestamp };
        const signRes = await fetch("/api/sign-cloudinary-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paramsToSign }),
        });
        if (!signRes.ok) throw new Error("Signing failed");
        const { signature } = (await signRes.json()) as { signature: string };

        // 2. Upload directly to Cloudinary with the signature.
        const form = new FormData();
        form.append("file", blob, originalName);
        form.append("api_key", apiKey!);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
          width: number;
          height: number;
          bytes: number;
          format: string;
        };

        // 3. Register the row in our DB so the library sees it next time.
        const fd = new FormData();
        fd.set("publicId", info.public_id);
        fd.set("url", info.secure_url);
        fd.set("originalName", info.original_filename ?? originalName);
        fd.set("width", String(info.width));
        fd.set("height", String(info.height));
        fd.set("bytes", String(info.bytes));
        fd.set("format", info.format);
        fd.set("folder", folder);
        const reg = await registerMedia(null, fd);
        if (reg?.error) {
          toast.error(reg.error);
          return;
        }

        toast.success(t("uploaded"));
        setStagedFile(null);
        onUploaded({
          // Registered row id, so the caller can persist it as a FK
          // immediately (posts.cover_media_id) without waiting for a refetch.
          id: reg?.id ?? "",
          publicId: info.public_id,
          url: info.secure_url,
          width: info.width,
          height: info.height,
          originalName: info.original_filename ?? originalName,
        });
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t("uploadFailed"));
      }
    });
  };

  // Cropper takes over the tab once a file is staged.
  if (stagedFile) {
    return (
      <ImageCropper
        file={stagedFile}
        aspect={aspect}
        uploading={pending}
        onCancel={() => setStagedFile(null)}
        onConfirm={(blob) => uploadBlob(blob, stagedFile.name)}
      />
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={`flex flex-col items-center gap-4 rounded-md border-2 border-dashed p-10 transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-input"
      }`}
    >
      <p className="text-muted-foreground text-sm">
        {tPicker("dropHint")}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={allowedFormats.map((f) => `.${f}`).join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so picking the same file twice still fires onChange.
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
      >
        <Upload className="me-2 size-4" />
        {pending ? tPicker("uploading") : tPicker("browse")}
      </Button>
    </div>
  );
}
