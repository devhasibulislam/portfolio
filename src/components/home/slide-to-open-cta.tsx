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
  const thumbRef = useRef<HTMLDivElement>(null);
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
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;
    const measure = () => {
      const cs = window.getComputedStyle(track);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const t = Math.max(
        0,
        track.clientWidth - thumb.offsetWidth - padL - padR,
      );
      travelRef.current = t;
      setTravel(t);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(thumb);
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

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = (e.clientX - startXRef.current) * dirRef.current;
    const max = travelPx();
    if (max <= 0) return;
    const next = Math.max(0, Math.min(1, startProgressRef.current + dx / max));
    updateProgress(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
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

  const translate = `translate3d(${progress * travel * dir}px, 0, 0)`;

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip open>
        <TooltipTrigger asChild>
          <div
            ref={trackRef}
            role="button"
            tabIndex={0}
            aria-label={tooltip}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLink();
              }
            }}
            className="group relative isolate inline-flex h-12 cursor-grab touch-none items-center gap-3 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/40 p-2 text-sm font-medium text-[var(--color-fg)] backdrop-blur transition-colors select-none hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg)]/60 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] active:cursor-grabbing"
          >
            <div
              ref={thumbRef}
              aria-hidden
              className={cn(
                "relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm ring-1 ring-inset ring-[var(--color-border)] transition-colors group-hover:ring-[var(--color-accent)]",
                dragging ? "" : "transition-transform duration-200 ease-out",
              )}
              style={{ transform: translate }}
            >
              {leadIcon}
            </div>
            <span
              className="relative z-0 flex-1 whitespace-nowrap pe-3 transition-opacity"
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
