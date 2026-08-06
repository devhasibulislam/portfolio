/**
 * Single source of truth for owner-specific site data.
 *
 * Everything a forker needs to change to make this portfolio their own
 * lives here — name, socials, contact channels, brand imagery, and the
 * featured GitHub repos on the home page. Combined with editing:
 *
 *   • `messages/*.json`        — translated copy (name in brand.name etc.)
 *   • `public/brand/`          — avatar + favicon assets
 *   • `public/social/`         — social icon assets (optional to swap)
 *   • `.env.local`             — secrets (never committed)
 *
 * a fork is complete without touching any component code.
 *
 * NOTHING in this file is a secret. Everything here ships to the browser.
 */
export const SITE_CONFIG = {
  /** Human name used in aria-labels, OG cards, and generic UI strings. */
  name: "Hasibul Islam",

  /** One-line tagline, used in OG cards + <meta name="description">. */
  tagline:
    "Senior full-stack engineer. Backend architecture, LLM/RAG systems, and production Node.js.",

  /** Bare production hostname printed on the OG card (no scheme). */
  productionHost: "devhasibulislam.vercel.app",

  /** Public username reused across social URLs, wa.me, t.me, etc. */
  username: "devhasibulislam",

  /** Contact email — shown in the floating actions menu. */
  email: "devhasibulislam@gmail.com",

  /** WhatsApp `wa.me` phone (no `+`, country code first). */
  phone: "8801906315901",

  /**
   * Social channels rendered in the public footer. Keys must match i18n
   * message keys under `footer.socials.<key>`. Leave any URL empty to
   * hide that icon.
   */
  socials: {
    linkedin: "https://linkedin.com/in/devhasibulislam",
    github: "https://github.com/devhasibulislam",
    facebook: "https://facebook.com/devhasibulislam",
    youtube: "https://youtube.com/@devhasibulislam",
    productHunt: "https://producthunt.com/@devhasibulislam",
  },

  /**
   * Brand assets. All paths are relative to the `public/` root — drop
   * new files in place with the same names to swap.
   */
  brand: {
    avatar: "/brand/avatar.jpg",
    favicon: "/brand/favicon.jpg",
  },
} as const;

/** Type helper so consumers get autocomplete on the socials keys. */
export type SocialKey = keyof typeof SITE_CONFIG.socials;
