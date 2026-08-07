"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Numeric count-up. Parses the leading integer out of the given value
 * string (e.g. "7+" → 7, "100%" → 100) and tweens 0 → target on first
 * viewport entry. The non-numeric suffix ("+", "%", or the original
 * literal like "2") is preserved. Reduced-motion visitors see the final
 * value from the start.
 *
 * Bengali/Arabic digits: if the string contains no ASCII digits we skip
 * the tween entirely and render the value literally — otherwise the
 * count-up would produce ASCII digits mid-tween and clash with the locale
 * formatting.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const LEADING_INT = /^(\d+)(.*)$/;

export function CountUp({ value }: { value: string }) {
  const scope = useRef<HTMLSpanElement>(null);
  const match = LEADING_INT.exec(value);
  const canAnimate = !!match;

  // Lazy initial state so SSR and no-JS visitors see the final value while
  // JS-capable browsers start the tween from zero on first viewport entry.
  const [display, setDisplay] = useState<string>(() =>
    canAnimate ? `0${match![2]}` : value,
  );

  useGSAP(
    () => {
      if (!canAnimate || !scope.current) return;
      const target = Number(match![1]);
      const suffix = match![2];

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const proxy = { n: 0 };
        gsap.to(proxy, {
          n: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => setDisplay(`${Math.round(proxy.n)}${suffix}`),
          scrollTrigger: {
            trigger: scope.current!,
            start: "top 85%",
            once: true,
          },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        setDisplay(value);
      });
    },
    { scope, dependencies: [value] },
  );

  return <span ref={scope}>{display}</span>;
}
