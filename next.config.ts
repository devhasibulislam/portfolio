import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Cloudinary is the media store per PROJECT_CONTEXT §2/§6.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  experimental: {},
  // Cache Components: enables `"use cache"` + `cacheTag()` per PROJECT_CONTEXT §13.
  // The dashboard mutations already call `updateTag()`; public readers opt in
  // via `"use cache"` inside RSCs (see `/blog`). Moved out of `experimental` in
  // Next 16.
  cacheComponents: true,
};

export default withNextIntl(nextConfig);
