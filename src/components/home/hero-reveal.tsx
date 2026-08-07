"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Mount-based reveal for hero content. Runs once on hydrate, staggering
 * direct children marked with `data-hero-line`. Respects `prefers-reduced-
 * motion` — reduced-motion visitors see everything placed statically.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export function HeroReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const targets =
        scope.current!.querySelectorAll<HTMLElement>("[data-hero-line]");
      if (!targets.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(targets, {
          y: 42,
          opacity: 0,
          filter: "blur(8px)",
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
        });
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
