"use client";

import { useEffect, useState } from "react";
import { PALETTE } from "./config";

/**
 * Full-viewport loading overlay for the hero. Renders opaque on the very
 * first SSR paint (plain CSS, no framer-motion hydration gap) so the
 * hero-behind never flashes into view. Two-stage progress:
 *   0 → 90%   animated tick over ~1.2s while the R3F chunk downloads.
 *   90 → 100% jumps once `ready` is true (Canvas `onCreated`).
 * Fades out via CSS opacity + pointer-events after hitting 100%.
 */
export function HeroLoader({ ready }: { ready: boolean }) {
  const [pct, setPct] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Fake tick 0 → 90 over ~1.2s so the bar never sits at 0 while the chunk
  // downloads.
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const elapsed = t - t0;
      const target = Math.min(90, (1 - Math.pow(1 - elapsed / 1200, 3)) * 90);
      setPct((p) => (p < target ? target : p));
      if (elapsed < 1200) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Snap to 100, then dismiss after a short delay for the fade.
  useEffect(() => {
    if (!ready) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external `ready` event mirrored to state
    setPct(100);
    const t = setTimeout(() => setDismissed(true), 400);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <div
      aria-hidden={dismissed}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6 transition-opacity duration-300 ease-out"
      style={{
        background: PALETTE.ink,
        color: PALETTE.cream,
        opacity: dismissed ? 0 : 1,
        pointerEvents: dismissed ? "none" : "auto",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.32em]"
        style={{ color: PALETTE.orange }}
      >
        Portfolio · Interactive
      </p>

      <div className="flex w-full max-w-[280px] flex-col gap-3">
        <div className="flex items-baseline justify-between text-xs">
          <span className="opacity-60">Loading scene</span>
          <span
            className="tabular-nums font-semibold"
            style={{ color: PALETTE.orange }}
          >
            {Math.round(pct).toString().padStart(2, "0")}%
          </span>
        </div>
        <div
          className="h-[2px] w-full overflow-hidden"
          style={{ background: `${PALETTE.cream}15` }}
        >
          <div
            className="h-full transition-[width] duration-300 ease-out"
            style={{ background: PALETTE.orange, width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
