"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText, useGSAP);
}

/**
 * Character-level reveal for the hero metric. Splits inner text into
 * chars via GSAP SplitText and staggers a blur+y drift on mount. Runs
 * only when `prefers-reduced-motion: no-preference` — reduced-motion
 * visitors see the text placed statically.
 */
export function SplitHeroMetric({
  children,
  delay = 0.3,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!scope.current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitText(scope.current!, { type: "chars" });
        gsap.from(split.chars, {
          yPercent: 60,
          opacity: 0,
          filter: "blur(10px)",
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.035,
          delay,
        });
        return () => split.revert();
      });
    },
    { scope },
  );

  return (
    <span ref={scope} className="inline-block">
      {children}
    </span>
  );
}
