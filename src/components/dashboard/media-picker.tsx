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
};

/**
 * Cover image picker. Renders the current cover thumbnail + Change/Remove
 * buttons; opens the reusable `ImagePickerDialog` (library + upload tabs,
 * enforces the 1.91:1 crop for OG covers). Freshly-uploaded assets are
 * appended to a local `fresh` list so the preview renders before the
 * server-side `options` prop rehydrates on the next router.refresh().
 */
export function MediaPicker({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState<MediaOption[]>([]);
  const merged = useMemo(() => [...fresh, ...options], [fresh, options]);
  const current = merged.find((o) => o.id === value) ?? null;

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
        <div className="relative">
          <CldImage
            src={current.publicId}
            width={640}
            height={335}
            crop="fill"
            gravity="auto"
            alt={current.originalName}
            className="w-full rounded-md border"
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
              aria-label="Remove cover"
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
          className="h-32 w-full border-dashed"
        >
          <ImagePlus className="me-2 size-5" />
          Pick or upload a cover
        </Button>
      )}

      <ImagePickerDialog
        open={open}
        onOpenChange={setOpen}
        options={merged}
        onSelect={handleSelect}
        aspect={1200 / 630}
      />
    </>
  );
}
