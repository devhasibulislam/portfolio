"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HOTSPOTS } from "./config";

/**
 * Non-R3F fallback. Served to touch devices, low-memory machines,
 * `prefers-reduced-motion` users, and software renderers. Same four
 * hotspot targets as the full experience, delivered as a stacked nav so
 * the intent survives without the scene. Framer + CSS only.
 */
export default function MobileFallback({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative flex min-h-[100svh] flex-col justify-end px-6 py-16">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            "radial-gradient(60% 45% at 65% 30%, rgba(232,107,28,0.18), transparent 65%)",
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
            <motion.li
              key={h.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
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
            </motion.li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
