import { ImageResponse } from "next/og";

// 180×180 apple-touch-icon. iOS Safari uses this when the site is added
// to the home screen. Registered in generateMetadata().icons.apple.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #E86B1C 0%, #F59E0B 100%)",
        color: "#0a0a0a",
        fontSize: 108,
        fontWeight: 700,
        fontFamily: "system-ui, sans-serif",
        borderRadius: 36,
      }}
    >
      H
    </div>,
    { ...size },
  );
}
