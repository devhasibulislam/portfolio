import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Public content is open to search + AI crawlers. Dashboard + login
      // are the only surfaces we hide (not linked publicly anyway, but the
      // rule doubles as a policy signal).
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/login"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
