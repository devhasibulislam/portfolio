"use client";

import dynamic from "next/dynamic";
import { PALETTE } from "@/components/home/config";

// R3F touches WebGL / DOMMatrix; ssr must be off.
const AmbientStarsCanvas = dynamic(() => import("./ambient-stars-canvas"), {
  ssr: false,
  // Ink base paints instantly while the R3F chunk downloads so there's no
  // white flash before the canvas mounts.
  loading: () => (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: PALETTE.ink }}
    />
  ),
});

export function AmbientStars() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: PALETTE.ink }}
    >
      <AmbientStarsCanvas />
    </div>
  );
}
