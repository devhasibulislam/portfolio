/**
 * Theme-aware page backdrop. Fixed behind everything at `-z-10`.
 *
 * - Dark mode (default): cream stars scattered on ink base, tiled at
 *   200×200. Reads as a subtle night sky without pulling attention off
 *   the type in front of it.
 * - Light mode: a fine ink dot-grid on cream — the same "engineering
 *   notebook" feel without inverting the metaphor. Stars on cream would
 *   look like specks of dust, so we switch texture entirely.
 *
 * Both variants use `var(--background)` so the base always matches the
 * shadcn palette. No JS, no WebGL, cheap on every device.
 */
export function StarBackdrop() {
  const starGradients = [
    "radial-gradient(1px 1px at 25px 8px, rgba(242,228,208,0.55), transparent 40%)",
    "radial-gradient(1.5px 1.5px at 92px 34px, rgba(242,228,208,0.7), transparent 45%)",
    "radial-gradient(1px 1px at 44px 78px, rgba(242,228,208,0.5), transparent 40%)",
    "radial-gradient(1px 1px at 130px 22px, rgba(242,228,208,0.6), transparent 45%)",
    "radial-gradient(2px 2px at 165px 92px, rgba(242,228,208,0.75), transparent 50%)",
    "radial-gradient(1px 1px at 12px 148px, rgba(242,228,208,0.5), transparent 40%)",
    "radial-gradient(1.5px 1.5px at 75px 162px, rgba(242,228,208,0.65), transparent 45%)",
    "radial-gradient(1px 1px at 178px 178px, rgba(242,228,208,0.55), transparent 40%)",
    "radial-gradient(1px 1px at 105px 118px, rgba(242,228,208,0.5), transparent 40%)",
  ].join(",");

  return (
    <>
      {/* Dark theme: cream stars over ink base. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 hidden dark:block"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage: starGradients,
          backgroundSize: "200px 200px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Light theme: engineering-notebook dot-grid over cream base. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 block dark:hidden"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage:
            "radial-gradient(rgba(15,19,26,0.09) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0",
        }}
      />
    </>
  );
}
