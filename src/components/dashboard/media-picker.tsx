"use client";

import { useState } from "react";
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
 * enforces the 1.91:1 crop for OG covers).
 */
export function MediaPicker({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value) ?? null;

  const handleSelect = (media: PickedMedia) => {
    // Library items already carry a DB id. Fresh uploads don't — they'll
    // land in the media list on the next `router.refresh()` fired by the
    // dialog; until then we still hand the caller the publicId so a preview
    // can render.
    onChange(media.id || media.publicId);
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
        options={options}
        onSelect={handleSelect}
        aspect={1200 / 630}
      />
    </>
  );
}
