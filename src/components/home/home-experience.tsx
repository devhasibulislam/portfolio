"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { detectCapability, type Capability } from "@/lib/capabilities";
import { HOTSPOTS } from "./config";
import { HotspotOverlay } from "./hotspot-overlay";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => null,
});
const MobileFallback = dynamic(() => import("./mobile-fallback"), {
  ssr: false,
  loading: () => null,
});

/**
 * Client dispatcher. Runs the capability probe once on mount, then loads
 * either the full R3F canvas or the reduced fallback. Both children live
 * behind `next/dynamic({ ssr: false })` so the R3F module never ships to
 * visitors who won't render it.
 *
 * Hotspot behaviour is centralised here so both trees resolve clicks the
 * same way: About + Projects open the overlay drawer; Blog + Resume route.
 */
export function HomeExperience() {
  const [capability, setCapability] = useState<Capability | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [overlayPanel, setOverlayPanel] = useState<"about" | "projects" | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCapability(detectCapability());
  }, []);

  const onSelect = useCallback(
    (id: string) => {
      const hs = HOTSPOTS.find((h) => h.id === id);
      if (!hs) return;
      if (hs.action.kind === "route") {
        router.push(hs.action.href);
        return;
      }
      setFocusId(id);
      setOverlayPanel(hs.action.panel);
    },
    [router],
  );

  const onClose = useCallback(() => {
    setFocusId(null);
    setOverlayPanel(null);
  }, []);

  if (capability === null) return null;

  return (
    <>
      {/* Canvas / fallback fills the viewport via an absolutely-positioned
          wrapper. Overlay drawer sits above at z-40+. */}
      <div className="absolute inset-0">
        {capability === "full" ? (
          <HeroScene focusId={focusId} onSelect={onSelect} />
        ) : (
          <MobileFallback onSelect={onSelect} />
        )}
      </div>
      <HotspotOverlay panel={overlayPanel} onClose={onClose} />
    </>
  );
}
