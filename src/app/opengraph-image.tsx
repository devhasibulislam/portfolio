import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/config/site";

// Route segment config — statically generated at build time.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline.split(".")[0]}`;

/**
 * Root OG image served for the marketing home page and inherited by any
 * child route that doesn't define its own `opengraph-image.tsx`. Rendered
 * via Satori (flexbox only, no `display: grid`), 1200×630 PNG per Twitter
 * `summary_large_image` and Open Graph guidance.
 */
export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #171717 55%, #1a0f08 100%)",
        color: "#f5f5f5",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* accent glow */}
      <div
        style={{
          position: "absolute",
          top: -240,
          right: -240,
          width: 720,
          height: 720,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(232,107,28,0.32) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* top: kicker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 28,
          letterSpacing: 6,
          color: "#e86b1c",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        <span
          style={{
            display: "flex",
            width: 12,
            height: 12,
            borderRadius: 9999,
            background: "#e86b1c",
          }}
        />
        Portfolio
      </div>

      {/* middle: name + tagline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          {SITE_CONFIG.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#a3a3a3",
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          {SITE_CONFIG.tagline}
        </div>
      </div>

      {/* bottom: URL */}
      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#737373",
          letterSpacing: 1,
        }}
      >
        {SITE_CONFIG.productionHost}
      </div>
    </div>,
    { ...size },
  );
}
