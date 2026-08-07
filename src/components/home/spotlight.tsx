"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Cursor tracker for the `.spot-bg` utility. Sets --spot-x / --spot-y as
 * the pointer moves; the CSS custom properties propagate to any nested
 * `.spot-bg` element and re-center its radial gradient. On pointer leave
 * the vars reset so the glow eases back to the top-right corner. Safe on
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
      className={cn("relative", className)}
    >
      {children}
    </div>
  );
}
