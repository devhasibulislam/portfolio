"use client";

import { useMemo, useState } from "react";
import { CldImage } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ImagePickerDialog,
  type PickedMedia,
} from "@/components/dashboard/image-picker";

export type MediaOption = {
  id: string;
  publicId: string;
  originalName: string;
};

type Props = {
  options: MediaOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  /**
   * Target aspect ratio (w/h). Drives both the preview thumbnail and the
   * ImageCropper's crop box. Defaults to OG 1.91:1 for backward compat
   * with existing cover pickers.
   */
  aspect?: number;
  /** Label shown on the empty-state button. */
  label?: string;
};

/**
 * Cover image picker. Renders the current cover thumbnail + Change/Remove
 * buttons; opens the reusable `ImagePickerDialog` (library + upload tabs,
 * enforcing whatever aspect is passed). Freshly-uploaded assets are
 * appended to a local `fresh` list so the preview renders before the
 * server-side `options` prop rehydrates on the next router.refresh().
 *
 * Aspects in use:
 *   1.91 : 1  → project cover / OG (default)
 *   1 : 1     → experience company logo, skill icon
 */
export function MediaPicker({
  options,
  value,
  onChange,
  aspect = 1200 / 630,
  label = "Pick or upload a cover",
}: Props) {
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState<MediaOption[]>([]);
  const merged = useMemo(() => [...fresh, ...options], [fresh, options]);
  const current = merged.find((o) => o.id === value) ?? null;

  // For near-square aspects (logos, icons) render a compact fixed-size
  // preview instead of stretching full-width. Threshold = 1.5, so
  // 4:3 (~1.33) and 1:1 render compact; 16:10 (~1.6) and OG stretch.
  const compact = aspect < 1.5;
  const previewWidth = compact ? 160 : 640;
  const previewHeight = Math.round(previewWidth / aspect);

  const handleSelect = (media: PickedMedia) => {
    // registerMedia returned the DB id on fresh uploads; keep a local copy
    // so the current row is findable even before router.refresh() lands the
    // new options prop from the server.
    if (media.id && !merged.some((o) => o.id === media.id)) {
      setFresh((prev) => [
        {
          id: media.id,
          publicId: media.publicId,
          originalName: media.originalName,
        },
        ...prev,
      ]);
    }
    onChange(media.id || null);
    setOpen(false);
  };

  return (
    <>
      {current ? (
        <div
          className={`relative ${compact ? "inline-block" : ""}`}
          style={compact ? { width: previewWidth } : undefined}
        >
          <CldImage
            src={current.publicId}
            width={previewWidth}
            height={previewHeight}
            crop="fill"
            gravity="auto"
            alt={current.originalName}
            className={compact ? "rounded-md border" : "w-full rounded-md border"}
          />
          <div className="absolute end-2 top-2 flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setOpen(true)}
            >
              Change
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Remove image"
              onClick={() => onChange(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className={
            compact
              ? "border-dashed inline-flex flex-col justify-center"
              : "h-32 w-full border-dashed"
          }
          style={
            compact ? { width: previewWidth, height: previewHeight } : undefined
          }
        >
          <ImagePlus className="me-2 size-5" />
          {label}
        </Button>
      )}

      <ImagePickerDialog
        open={open}
        onOpenChange={setOpen}
        options={merged}
        onSelect={handleSelect}
        aspect={aspect}
      />
    </>
  );
}
