"use client";

import { useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CtaButton } from "@/components/cta-button";

const DRAG_THRESHOLD_PX = 40;

/** Secondary CTA that opens on click OR on horizontal drag past a threshold. */
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
  const startX = useRef<number | null>(null);
  const dragSucceeded = useRef(false);

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex touch-pan-y"
            onPointerDown={(e) => {
              if (e.pointerType === "mouse" && e.button !== 0) return;
              startX.current = e.clientX;
              dragSucceeded.current = false;
            }}
            onPointerMove={(e) => {
              if (startX.current == null) return;
              if (Math.abs(e.clientX - startX.current) >= DRAG_THRESHOLD_PX) {
                dragSucceeded.current = true;
              }
            }}
            onPointerUp={() => {
              if (dragSucceeded.current) {
                window.open(href, "_blank", "noopener,noreferrer");
              }
              startX.current = null;
            }}
            onClickCapture={(e) => {
              if (dragSucceeded.current) {
                e.preventDefault();
                e.stopPropagation();
                dragSucceeded.current = false;
              }
            }}
          >
            <CtaButton
              href={href}
              variant="secondary"
              external
              leadIcon={leadIcon}
            >
              {children}
            </CtaButton>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
