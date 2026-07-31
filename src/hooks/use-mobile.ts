import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * SSR-safe viewport-based mobile detector. Uses `useSyncExternalStore` so the
 * initial render matches the actual viewport with no post-mount setState
 * (React 19 lint: no setState inside effect bodies).
 */
export function useIsMobile() {
  const subscribe = React.useCallback((onChange: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false, // server snapshot — desktop-first
  );
}
