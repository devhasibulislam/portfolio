"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Slim top progress bar shown during route navigation on every page (public,
 * dashboard, login). `position: fixed` keeps it out of the layout flow, so
 * pages with no other content stay non-scrolling.
 *
 * The lifecycle:
 *   1. On any internal <a> click (or link with role="link"), start progress.
 *   2. While `state === "progress"`, the bar animates from 0 to 90% width
 *      over ~900 ms — mimicking YouTube/GitHub's indeterminate hint.
 *   3. When `usePathname()` changes, snap to 100% and fade out.
 *
 * Trade-off (ponytail: no library): we don't cover `router.push` fired from
 * code (form actions, buttons), only anchor clicks + Link navigations.
 * Add an nprogress-style lib when a programmatic-nav flow needs the feedback.
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "progress" | "done">("idle");
  const prevPathname = useRef(pathname);

  // Complete the bar when the URL actually changes.
  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    setState("done");
    const t = setTimeout(() => setState("idle"), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  // Kick off progress on internal link clicks. Capture-phase so we run
  // before Next's own click handler.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      setState("progress");
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const widthClass =
    state === "progress" ? "w-[90%]" : state === "done" ? "w-full" : "w-0";
  const opacityClass = state === "idle" ? "opacity-0" : "opacity-100";
  const speedClass =
    state === "progress"
      ? "duration-[900ms] ease-out"
      : "duration-200 ease-linear";

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] transition-opacity duration-300 ${opacityClass}`}
    >
      <div
        className={`bg-primary h-full shadow-[0_0_10px_var(--color-brand-highlight)] transition-[width] ${speedClass} ${widthClass}`}
      />
    </div>
  );
}
