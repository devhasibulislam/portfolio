import { HomeExperience } from "@/components/home/home-experience";

/**
 * Phase 4 hero. `HomeExperience` runs the capability probe, picks the R3F
 * scene or the framer fallback, and hosts the hotspot overlay drawer. The
 * page itself is just a full-viewport shell so both trees can render
 * absolutely inside a stable box.
 */
export default function HomePage() {
  // The hero is always dark ("§16 dark-mode-first aesthetic"), even when the
  // site theme cookie is `light`. Pull the main up under the sticky header
  // and repad from inside so the canvas fills the viewport edge-to-edge.
  return (
    <main
      data-theme="dark"
      // Header is fixed and floats over the canvas; hero fills the full
      // viewport exactly so `/` never scrolls.
      className="relative h-[100svh] w-full overflow-hidden"
      style={{ background: "#0f131a", color: "#f2e4d0" }}
    >
      <HomeExperience />

      {/* Hero overlay. Top-left, well below the sticky site header. */}
      <div className="pointer-events-none absolute inset-0 z-10 mx-auto flex max-w-6xl flex-col justify-between px-6 pt-24 pb-16">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e86b1c]">
            Portfolio · Interactive
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Hasibul Islam
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-[#f2e4d0]/85">
            Senior full-stack engineer. Backend architecture, LLM/RAG systems,
            and production Node.js.
          </p>
        </div>
        <p className="text-xs uppercase tracking-widest text-[#f2e4d0]/50">
          Click a glowing node to explore →
        </p>
      </div>
    </main>
  );
}
