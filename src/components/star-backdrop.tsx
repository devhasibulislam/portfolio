/**
 * CSS-only starfield backdrop. Layered radial-gradients tiled at 200×200
 * paint a subtle star pattern over the deep ink base. No JS, no WebGL,
 * cheap on every device. Used behind `/blog*` per PROJECT_CONTEXT §16.
 */
export function StarBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundColor: "#0f131a",
        backgroundImage: [
          "radial-gradient(1px 1px at 25px 8px, rgba(242,228,208,0.55), transparent 40%)",
          "radial-gradient(1.5px 1.5px at 92px 34px, rgba(242,228,208,0.7), transparent 45%)",
          "radial-gradient(1px 1px at 44px 78px, rgba(242,228,208,0.5), transparent 40%)",
          "radial-gradient(1px 1px at 130px 22px, rgba(242,228,208,0.6), transparent 45%)",
          "radial-gradient(2px 2px at 165px 92px, rgba(242,228,208,0.75), transparent 50%)",
          "radial-gradient(1px 1px at 12px 148px, rgba(242,228,208,0.5), transparent 40%)",
          "radial-gradient(1.5px 1.5px at 75px 162px, rgba(242,228,208,0.65), transparent 45%)",
          "radial-gradient(1px 1px at 178px 178px, rgba(242,228,208,0.55), transparent 40%)",
          "radial-gradient(1px 1px at 105px 118px, rgba(242,228,208,0.5), transparent 40%)",
        ].join(","),
        backgroundSize: "200px 200px",
        backgroundRepeat: "repeat",
      }}
    />
  );
}
