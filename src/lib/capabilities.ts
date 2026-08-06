"use client";

/**
 * Client-only capability check that decides whether to render the full R3F
 * hero or the reduced-motion / low-power fallback. Runs on mount so nothing
 * Three-related ships into the initial bundle (the R3F module is dynamic-
 * imported downstream in `HomeExperience`).
 *
 * Signals:
 *   1. `prefers-reduced-motion: reduce` → user opted out of animation.
 *   2. Primary input is coarse (`pointer:coarse`) → treat as touch device.
 *
 * ponytail: dropped the WebGL2 sniff + `deviceMemory` check — WebGL2 is
 * universal on any browser that ships in 2026, and `deviceMemory` is a
 * Chromium-only heuristic that added a whole `if` for one browser family.
 * The two `matchMedia` checks catch the users who actually benefit from
 * the fallback (touch + reduced-motion opt-ins).
 */
export type Capability = "full" | "fallback";

export function detectCapability(): Capability {
  // SSR guard — should never actually run server-side but be explicit.
  if (typeof window === "undefined") return "fallback";
  const mq = (q: string) => window.matchMedia?.(q).matches;
  return mq("(prefers-reduced-motion: reduce)") || mq("(pointer: coarse)")
    ? "fallback"
    : "full";
}
