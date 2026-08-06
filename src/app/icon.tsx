import { ImageResponse } from "next/og";

// 32×32 favicon PNG generated at build time. Consumed by
// generateMetadata().icons.icon in the root layout.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #E86B1C 0%, #F59E0B 100%)",
          color: "#0a0a0a",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 6,
        }}
      >
        H
      </div>
    ),
    { ...size },
  );
}
