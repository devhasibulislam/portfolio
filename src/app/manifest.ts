import type { MetadataRoute } from "next";

/**
 * PWA / web-app-manifest for the site. Read by Chrome + Edge when the user
 * hits "Install" and by iOS Safari when the page is added to the home
 * screen. Icons resolve to /icon and /apple-icon which Next builds from
 * the sibling icon.tsx + apple-icon.tsx files.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hasibul Islam",
    short_name: "Hasibul Islam",
    description:
      "Senior full-stack engineer. Backend architecture, LLM/RAG systems, and production Node.js.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "en",
    dir: "ltr",
    categories: ["portfolio", "productivity", "developer"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
