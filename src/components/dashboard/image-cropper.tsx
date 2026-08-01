"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";

type Props = {
  file: File;
  /**
   * Fixed aspect ratio (width / height). Omit for free-form crop.
   */
  aspect?: number;
  onCancel: () => void;
  onConfirm: (blob: Blob, cropped: { width: number; height: number }) => void;
};

/**
 * Free-form image cropper. Displays the source image with a drag-to-position
 * / drag-to-resize crop rect. Shows the live px dimensions of the current
 * crop so the owner can eyeball the output resolution before saving.
 *
 * On confirm: rasterizes the crop area to an off-screen canvas and returns
 * a Blob (same format as the input, JPEG fallback). We keep the image on
 * the client and let the caller decide what to do with the blob (usually
 * a signed upload to Cloudinary).
 */
export function ImageCropper({ file, aspect, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [pending, setPending] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  // Create the blob URL inside an effect so it survives React 19 strict-mode
  // remount without being revoked mid-render. Cleanup runs on real unmount.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing blob URL lifecycle to component mount
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback(
    (_: Area, cropped: Area) => setCroppedArea(cropped),
    [],
  );

  const confirm = async () => {
    if (!croppedArea || !src) return;
    setPending(true);
    try {
      const blob = await cropToBlob(src, croppedArea, file.type);
      onConfirm(blob, {
        width: Math.round(croppedArea.width),
        height: Math.round(croppedArea.height),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-muted relative h-[55vh] w-full overflow-hidden rounded-md">
        {src ? (
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-40"
          />
        </label>
        <span className="text-muted-foreground tabular-nums">
          {croppedArea
            ? `${Math.round(croppedArea.width)} × ${Math.round(croppedArea.height)} px`
            : "…"}
        </span>
        {aspect ? (
          <span className="text-muted-foreground">
            Locked to {aspect.toFixed(2)}:1
          </span>
        ) : (
          <span className="text-muted-foreground">Any ratio</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="button" onClick={confirm} disabled={pending}>
          {pending ? "Cropping…" : "Use crop"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Rasterizes a portion of an image URL to a canvas and returns a Blob.
 * Same format as the source when supported; falls back to JPEG.
 */
async function cropToBlob(
  src: string,
  area: Area,
  fileType: string,
): Promise<Blob> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");
  ctx.drawImage(
    img,
    Math.round(area.x),
    Math.round(area.y),
    Math.round(area.width),
    Math.round(area.height),
    0,
    0,
    Math.round(area.width),
    Math.round(area.height),
  );

  const outType =
    fileType === "image/png" || fileType === "image/webp"
      ? fileType
      : "image/jpeg";
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Blob encode failed"))),
      outType,
      // JPEG/WebP quality — plenty for OG covers.
      0.92,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
