"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Cursor-tracked radial glow overlay. Sets --spot-x / --spot-y on the
 * wrapper as the pointer moves; the ::before layer paints a soft orange
 * gradient at that position, faded to invisible unless the group is
 * hovered. Purely visual, no measurable interactivity — safe on touch.
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
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      }}
      className={cn("group/spot relative isolate", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0px), rgba(232,107,28,0.22), transparent 45%)",
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
