"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
 * Cover image picker. Shows current cover (or Add button), opens a grid dialog
 * of media rows, calls `onChange` with the new id. Uploads live on the Media
 * page — this picker only reuses existing rows.
 */
export function MediaPicker({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value) ?? null;

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
          disabled={options.length === 0}
        >
          <ImagePlus className="me-2 size-5" />
          {options.length === 0
            ? "Upload one on the Media page first"
            : "Pick a cover"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pick a cover image</DialogTitle>
            <DialogDescription>
              Only images uploaded to Media appear here. Delivered at 1200×630.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {options.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={`focus-visible:ring-ring block w-full overflow-hidden rounded-md border transition-all hover:ring-2 focus-visible:ring-2 ${
                    m.id === value ? "ring-primary ring-2" : ""
                  }`}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
