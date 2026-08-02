import { ImageResponse } from "next/og";
import { getPublishedPostBySlug } from "@/lib/db/queries/public-posts";

// Next 16 dynamic OG image convention. Used only when
// `metadata.openGraph.images` isn't set — i.e. for posts without a cover.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  const title = post?.title ?? "Blog post";
  const category = post?.categoryName ?? "Hasibul Islam";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0b0f1a 0%, #101b2c 55%, #17233a 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 28,
          textTransform: "uppercase",
          letterSpacing: 4,
          opacity: 0.7,
        }}
      >
        {category}
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          lineHeight: 1.1,
          display: "flex",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 28, opacity: 0.6 }}>hasibul.dev</div>
    </div>,
    size,
  );
}
