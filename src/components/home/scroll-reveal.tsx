"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Reusable scroll-triggered reveal. Wraps children and animates them from
 * a slightly-lowered / slightly-blurred / zero-opacity state into place the
 * first time they cross into the viewport. Once only — no scrub — because
 * the home page is a highlight reel, not a scrollytelling piece.
 *
 * Respects `prefers-reduced-motion` via `gsap.matchMedia` (skips the tween
 * entirely so screen-reader users and low-motion visitors see everything
 * placed statically).
 *
 * If children is a list, pass `stagger` to have each direct child animate
 * in sequence. Direct children must be block-level elements — the tween
 * targets them via `[data-reveal]`.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function ScrollReveal({
  children,
  as = "div",
  className,
  stagger = 0,
  y = 32,
  delay = 0,
}: {
  children: React.ReactNode;
  as?: "div" | "section" | "ul" | "ol";
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
}) {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!scope.current) return;
      // Always animate the wrapper itself so a visible card shell doesn't
      // sit on the page while its `data-reveal` children are held at
      // opacity: 0. When `stagger` is set the wrapper leads the sequence
      // and each `[data-reveal]` follows in cadence.
      const children = scope.current.querySelectorAll<HTMLElement>(
        "[data-reveal]",
      );
      const targets: HTMLElement[] = stagger
        ? [scope.current, ...Array.from(children)]
        : [scope.current];

      const mm = gsap.matchMedia();
      mm.add(
        {
          motionOk: "(prefers-reduced-motion: no-preference)",
          motionReduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          if (!ctx.conditions?.motionOk) return;
          gsap.from(targets, {
            y,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.9,
            ease: "power3.out",
            stagger: stagger || 0,
            delay,
            scrollTrigger: {
              trigger: scope.current!,
              start: "top 82%",
              once: true,
            },
          });
        },
      );
    },
    { scope: scope as React.RefObject<HTMLElement> },
  );

  // Explicit branches keep the JSX ref types honest without the polymorphic-
  // component gymnastics that fight React 19's strict prop inference.
  switch (as) {
    case "section":
      return (
        <section
          ref={scope as React.RefObject<HTMLElement | null>}
          className={className}
        >
          {children}
        </section>
      );
    case "ul":
      return (
        <ul
          ref={scope as unknown as React.RefObject<HTMLUListElement | null>}
          className={className}
        >
          {children}
        </ul>
      );
    case "ol":
      return (
        <ol
          ref={scope as unknown as React.RefObject<HTMLOListElement | null>}
          className={className}
        >
          {children}
        </ol>
      );
    default:
      return (
        <div
          ref={scope as unknown as React.RefObject<HTMLDivElement | null>}
          className={className}
        >
          {children}
        </div>
      );
  }
}
