"use client";

/**
 * Client-only capability check that decides whether to render the full R3F
 * hero or the reduced-motion / low-power fallback. Runs on mount so nothing
 * Three-related ships into the initial bundle (the R3F module is dynamic-
 * imported downstream in `HomeExperience`).
 *
 * Signals (all cheap):
 *   1. WebGL support + software-renderer sniff via `WEBGL_debug_renderer_info`.
 *   2. `navigator.deviceMemory` < 4 GB → assume the machine can't afford it.
 *   3. Primary input is coarse (`pointer:coarse`) → treat as touch device.
 *   4. `prefers-reduced-motion: reduce` → user opted out of animation.
 *
 * ponytail: no benchmark loop, no FPS probe — those add 1 s of startup for
 * a signal the 4 checks above already approximate.
 */
export type Capability = "full" | "fallback";

export function detectCapability(): Capability {
  // SSR guard — should never actually run server-side but be explicit.
  if (typeof window === "undefined") return "fallback";

  const reduceMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion) return "fallback";

  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  if (coarsePointer) return "fallback";

  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) {
    return "fallback";
  }

  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl2") ??
    canvas.getContext("webgl")) as WebGLRenderingContext | null;
  if (!gl) return "fallback";

  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = ext
    ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "")
    : "";
  if (/SwiftShader|llvmpipe|software/i.test(renderer)) return "fallback";

  return "full";
}
