"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Slide-to-unlock style CTA: drag the icon along the track OR click to open. */
export function SlideToOpenCta({
  href,
  tooltip,
  leadIcon,
  children,
}: {
  href: string;
  tooltip: string;
  leadIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [travel, setTravel] = useState(0);
  const draggingRef = useRef(false);
  const dirRef = useRef<1 | -1>(1);
  const travelRef = useRef(0);
  const startXRef = useRef(0);
  const startProgressRef = useRef(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const t = Math.max(0, el.clientWidth - 48 - 12);
      travelRef.current = t;
      setTravel(t);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openLink = useCallback(() => {
    window.open(href, "_blank", "noopener,noreferrer");
  }, [href]);

  const travelPx = () => travelRef.current;

  const updateProgress = (p: number) => {
    progressRef.current = p;
    setProgress(p);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // synthetic pointer events (e.g. dispatched by tests) can't be captured
    }
    const nextDir = document.documentElement.dir === "rtl" ? -1 : 1;
    dirRef.current = nextDir;
    setDir(nextDir);
    startXRef.current = e.clientX;
    startProgressRef.current = progressRef.current;
    draggingRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    const dx = (e.clientX - startXRef.current) * dirRef.current;
    const max = travelPx();
    if (max <= 0) return;
    const next = Math.max(0, Math.min(1, startProgressRef.current + dx / max));
    updateProgress(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // synthetic pointer events
    }
    draggingRef.current = false;
    setDragging(false);
    if (progressRef.current >= 0.85) {
      updateProgress(1);
      openLink();
      window.setTimeout(() => updateProgress(0), 350);
    } else {
      updateProgress(0);
    }
  };

  const onTrackClick = (e: React.MouseEvent<HTMLElement>) => {
    if (progressRef.current > 0.02) {
      e.preventDefault();
      return;
    }
    openLink();
  };

  const translate = `translate3d(${progress * travel * dir}px, 0, 0)`;

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={trackRef}
            role="link"
            tabIndex={0}
            aria-label={tooltip}
            onClick={onTrackClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLink();
              }
            }}
            className="group relative isolate inline-flex h-12 cursor-pointer items-center gap-3 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/40 ps-1.5 pe-6 text-sm font-medium text-[var(--color-fg)] backdrop-blur transition-colors select-none hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg)]/60 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 start-0 rounded-full bg-[var(--color-accent)]/10 transition-[width] duration-100"
              style={{ width: `calc(48px + ${progress * 100}%)` }}
            />
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative z-10 inline-flex size-9 shrink-0 cursor-grab items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 text-[var(--color-fg)] shadow-sm touch-none group-hover:border-[var(--color-accent)]/40 group-hover:text-[var(--color-accent)] active:cursor-grabbing",
                dragging ? "" : "transition-transform duration-200 ease-out",
              )}
              style={{ transform: translate }}
            >
              {leadIcon}
            </button>
            <span
              className="relative z-0 flex-1 whitespace-nowrap transition-opacity"
              style={{ opacity: 1 - progress * 0.6 }}
            >
              {children}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
