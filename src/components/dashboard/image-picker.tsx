"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
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
   * Optional fixed aspect ratio for the crop step (e.g. 1.91 for OG cover).
   * Omit for free-form.
   */
  aspect?: number;
  /**
   * Which folder to store new uploads under. Defaults to portfolio/posts —
   * used by both post covers and inline body images so they share the pool.
   */
  folder?: string;
  /**
   * Cloudinary Upload Widget will pre-check this on the client, then again
   * server-side. 1MB per §5.
   */
  maxFileSize?: number;
  /** File extensions accepted. Defaults to the §5 image set. */
  allowedFormats?: readonly string[];
};

/**
 * Reusable pick-or-upload modal. Two tabs:
 *   - Library: grid of media rows already in Cloudinary + our DB.
 *   - Upload:  CldUploadWidget with client-side size/format guard and an
 *              optional crop step (Cloudinary's own cropping UI, controlled
 *              via `aspect`). New assets are registered via `registerMedia`
 *              so they show up under the same picker the next time.
 * Wired into both the Cover picker and the Tiptap Image tool.
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
  const router = useRouter();
  const [tab, setTab] = useState<"library" | "upload">(
    options.length > 0 ? "library" : "upload",
  );
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick an image</DialogTitle>
          <DialogDescription>
            {allowedFormats.map((f) => f.toUpperCase()).join(", ")} · up to{" "}
            {Math.round(maxFileSize / 1024 / 1024)} MB
            {aspect ? ` · cropped to ${aspect.toFixed(2)}:1` : " · any ratio"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "library" | "upload")}
        >
          <TabsList>
            <TabsTrigger value="library" disabled={options.length === 0}>
              Library
              {options.length > 0 ? (
                <span className="text-muted-foreground ms-2 tabular-nums">
                  {options.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="upload">Upload new</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="pt-2">
            {options.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Nothing here yet. Use the Upload tab.
              </p>
            ) : (
              <ul className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pe-1 sm:grid-cols-3">
                {options.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() =>
                        // Library items are already the "raw" versions; caller
                        // will decide how to render them (CldImage with any
                        // transform they need).
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
            <CldUploadWidget
              signatureEndpoint="/api/sign-cloudinary-params"
              options={{
                sources: ["local", "url"],
                multiple: false,
                maxFiles: 1,
                maxFileSize,
                folder,
                clientAllowedFormats: [...allowedFormats],
                cropping: true,
                croppingAspectRatio: aspect,
                croppingCoordinatesMode: aspect ? "custom" : undefined,
                croppingShowDimensions: true,
                croppingShowBackButton: true,
                showSkipCropButton: !aspect,
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
                fd.set(
                  "url",
                  String((info as { secure_url: string }).secure_url),
                );
                fd.set(
                  "originalName",
                  String(
                    (info as { original_filename?: string })
                      .original_filename ?? info.public_id,
                  ),
                );
                fd.set("width", String((info as { width: number }).width));
                fd.set("height", String((info as { height: number }).height));
                fd.set("bytes", String((info as { bytes: number }).bytes));
                fd.set("format", String((info as { format: string }).format));
                fd.set("folder", folder);
                startTransition(async () => {
                  const res = await registerMedia(null, fd);
                  if (res?.error) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("Uploaded");
                  onSelect({
                    id: "", // freshly uploaded — id is assigned on next fetch
                    publicId: String(info.public_id),
                    url: String((info as { secure_url: string }).secure_url),
                    width: (info as { width: number }).width,
                    height: (info as { height: number }).height,
                    originalName: String(
                      (info as { original_filename?: string })
                        .original_filename ?? info.public_id,
                    ),
                  });
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
              {({ open: openWidget }) => (
                <div className="flex flex-col items-center gap-4 py-10">
                  <p className="text-muted-foreground text-sm">
                    Drag &amp; drop or click to select a file.
                  </p>
                  <Button
                    type="button"
                    onClick={() => openWidget()}
                    disabled={pending}
                  >
                    <Upload className="me-2 size-4" />
                    {pending ? "Uploading…" : "Choose file"}
                  </Button>
                </div>
              )}
            </CldUploadWidget>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
