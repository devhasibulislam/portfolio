"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Cursor-tracked radial glow overlay. The gradient sits on top of the
 * card with `mix-blend-mode: plus-lighter` so it tints the surface near
 * the pointer without hiding the content underneath. Position defaults
 * to the card's top-right corner and follows the pointer while the card
 * is hovered; eases back to the corner on leave. Purely visual, safe on
 * touch (pointermove without contact never fires).
 */
export function Spotlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      }}
      onPointerLeave={() => {
        const el = ref.current;
        if (!el) return;
        el.style.removeProperty("--spot-x");
        el.style.removeProperty("--spot-y");
      }}
      className={cn("group/spot relative isolate", className)}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-60 mix-blend-soft-light transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--spot-x, 92%) var(--spot-y, 8%), rgba(232,107,28,0.55), transparent 55%)",
        }}
      />
    </div>
  );
}

