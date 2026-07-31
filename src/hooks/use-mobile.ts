import * as React from "react";

// Bumped from 768 to 1024 so the sidebar behaves as a drawer at tablet sizes
// where an expanded 256px rail leaves too little room for our tables/forms.
const MOBILE_BREAKPOINT = 1024;

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
