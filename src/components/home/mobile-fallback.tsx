"use client";

import { Button } from "@/components/ui/button";
import { HOTSPOTS } from "./config";

/**
 * Non-R3F fallback. Served to touch devices, low-memory machines,
 * `prefers-reduced-motion` users, and software renderers. Same four
 * hotspot targets as the full experience, delivered as a stacked nav so
 * the intent survives without the scene. Pure CSS animations — no JS
 * animation runtime shipped for this reduced-motion-first page.
 */
export default function MobileFallback({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative flex min-h-[100svh] flex-col justify-end px-6 py-16">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 motion-safe:animate-[fallback-fade_1.2s_ease-out_both] opacity-100 motion-safe:opacity-0"
        style={{
          background:
            "radial-gradient(60% 45% at 65% 30%, rgba(232,107,28,0.18), transparent 65%)",
          animationFillMode: "forwards",
        }}
      />
      <p className="text-xs uppercase tracking-widest opacity-60">Portfolio</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Hasibul Islam
      </h1>
      <p className="mt-2 max-w-md text-lg opacity-80">
        Senior full-stack engineer. Backend architecture, LLM/RAG systems, and
        production Node.js.
      </p>

      <nav className="mt-10">
        <ul className="flex flex-col gap-2">
          {HOTSPOTS.map((h, i) => (
            <li
              key={h.id}
              className="motion-safe:animate-[fallback-rise_0.4s_ease-out_both] motion-reduce:opacity-100"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <Button
                variant="outline"
                onClick={() => onSelect(h.id)}
                className="group hover:border-[var(--color-accent)] flex h-auto w-full items-center justify-between rounded-lg px-4 py-3 text-start"
              >
                <span className="text-base font-medium">{h.label}</span>
                <span
                  aria-hidden
                  className="text-xl transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <style>{`
        @keyframes fallback-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fallback-rise {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
