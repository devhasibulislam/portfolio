"use client";

import { X } from "lucide-react";
import { ABOUT_COPY, PROJECTS } from "./config";

/**
 * Right-side slide-in drawer. Renders one of two panels: About (bio prose)
 * or Projects (four cards). Kept as plain CSS transitions on a container so
 * we don't drag another lib in for a single slide.
 */
export function HotspotOverlay({
  panel,
  onClose,
}: {
  panel: "about" | "projects" | null;
  onClose: () => void;
}) {
  const open = panel !== null;
  return (
    <>
      {/* Scrim — dims the scene, click to close. */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${
          open
            ? "pointer-events-auto bg-black/40 opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`bg-[var(--color-surface)] text-[var(--color-fg)] border-[var(--color-border)] fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col border-s shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0.24,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <p className="text-xs uppercase tracking-widest opacity-60">
            {panel ?? ""}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="hover:text-[var(--color-accent)] rounded-md p-1 transition-colors"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {panel === "about" ? <AboutPanel /> : null}
          {panel === "projects" ? <ProjectsPanel /> : null}
        </div>
      </aside>
    </>
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
