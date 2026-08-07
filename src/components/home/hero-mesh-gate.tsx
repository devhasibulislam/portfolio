"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectCapability } from "@/lib/capabilities";

/**
 * Client-side gate for `HeroMesh`. Runs the capability probe on mount and
 * only asks Next.js to fetch the R3F chunk if the visitor is on a full-
 * power device with motion preferences allowing it. On touch or reduced-
 * motion devices this component renders nothing — the CSS starfield in
 * `<HeroBackdrop />` carries the visual load.
 */

const HeroMesh = dynamic(() => import("./hero-mesh"), {
  ssr: false,
  loading: () => null,
});

export function HeroMeshGate() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOk(detectCapability() === "full");
  }, []);

  if (!ok) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-0 opacity-90"
    >
      <HeroMesh />
    </div>
  );
}
