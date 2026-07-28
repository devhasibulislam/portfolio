import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Cloudinary is the media store per PROJECT_CONTEXT §2/§6.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    // Placeholder for Cache Components / Turbopack tweaks per PROJECT_CONTEXT §13.
  },
};

export default withNextIntl(nextConfig);
