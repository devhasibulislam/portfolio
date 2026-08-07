"use client";

import Image from "next/image";

const companies = [
  { name: "Ithra", src: "/company/Ithra.webp" },
  { name: "MessageMind", src: "/company/messagemind.webp" },
  { name: "NadlanOne", src: "/company/nadlanone.webp" },
  { name: "Offline Comics", src: "/company/offline-comics.webp" },
  { name: "WeWise", src: "/company/wewise.webp" },
  { name: "WiseLead", src: "/company/wiselead.webp" },
  { name: "Zubion", src: "/company/zubion.webp" },
] as const;

/**
 * Trust strip below the hero. Pure-CSS marquee — no JS, no deps.
 * Track is duplicated so the loop can translate -50% and read seamless.
 * Pauses on hover and honours `prefers-reduced-motion` (see globals.css).
 * `dir="ltr"` keeps the scroll direction consistent in RTL locales.
 */
export function HeroLogoMarquee({ label }: { label: string }) {
  return (
    <div dir="ltr" className="w-full">
      <p className="text-muted-foreground/70 mb-6 text-center font-mono text-[11px] tracking-[0.22em] uppercase">
        {label}
      </p>

      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        aria-label="Companies I've worked with"
      >
        <div className="animate-marquee flex w-max items-center gap-16 py-2 group-hover:[animation-play-state:paused]">
          {[...companies, ...companies].map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="relative h-10 w-32 shrink-0 opacity-70 grayscale [filter:grayscale(1)_contrast(1.05)]"
            >
              <Image
                src={c.src}
                alt={c.name}
                fill
                sizes="128px"
                className="object-contain"
                aria-hidden={i >= companies.length}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
