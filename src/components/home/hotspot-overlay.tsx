"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ABOUT_COPY, PROJECTS } from "./config";

/**
 * Right-side slide-in panel for About / Projects hotspots. Shadcn Sheet
 * handles the drawer + scrim + close button + a11y.
 */
export function HotspotOverlay({
  panel,
  onClose,
}: {
  panel: "about" | "projects" | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={panel !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full max-w-md gap-0">
        <SheetHeader className="border-b border-[var(--color-border)] px-6 py-4">
          <SheetTitle className="text-xs uppercase tracking-widest opacity-60 font-normal">
            {panel ?? ""}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {panel === "about" ? <AboutPanel /> : null}
          {panel === "projects" ? <ProjectsPanel /> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AboutPanel() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">Hasibul Islam</h2>
      {ABOUT_COPY.split("\n\n").map((para, i) => (
        <p key={i} className="text-base leading-relaxed opacity-85">
          {para}
        </p>
      ))}
    </div>
  );
}

function ProjectsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
      <ul className="flex flex-col gap-3">
        {PROJECTS.map((p) => (
          <li key={p.title}>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-[var(--color-border)] hover:border-[var(--color-accent)] focus-visible:border-[var(--color-accent)] block rounded-lg border p-4 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-sm">{p.title}</span>
                <span className="text-xs uppercase tracking-widest opacity-60">
                  {p.role}
                </span>
              </div>
              <p className="mt-2 text-sm opacity-80">{p.blurb}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
