/**
 * Phase 4 configuration. Single source of truth for the hero composition,
 * the four hotspots, and the About / Projects overlay content. Colors come
 * from `globals.css` per PROJECT_CONTEXT §16 (dark base, burnt orange glow).
 *
 * Add a new hotspot: append to HOTSPOTS. Everything else picks it up.
 */

export const PALETTE = {
  ink: "#0f131a", // near-black background
  navy: "#252e3f", // secondary surface / form base
  orange: "#e86b1c", // hotspot glow, accents
  shadow: "#b84a0f", // pressed accent
  cream: "#f2e4d0", // text on dark
} as const;

export type HotspotAction =
  | { kind: "overlay"; panel: "about" | "projects" }
  | { kind: "route"; href: "/blog" | "/resume" };

export type Hotspot = {
  id: string;
  label: string;
  /** World-space position `[x, y, z]`. */
  position: [number, number, number];
  action: HotspotAction;
};

// Front-facing arc: 4 hotspots on the near side of the composition so the
// labels are always readable and don't hide behind the centerpiece.
export const HOTSPOTS: Hotspot[] = [
  {
    id: "about",
    label: "About",
    position: [-3.0, 1.6, 2.8],
    action: { kind: "overlay", panel: "about" },
  },
  {
    id: "projects",
    label: "Projects",
    position: [-1.1, 0.5, 3.6],
    action: { kind: "overlay", panel: "projects" },
  },
  {
    id: "blog",
    label: "Blog",
    position: [1.1, 0.5, 3.6],
    action: { kind: "route", href: "/blog" },
  },
  {
    id: "resume",
    label: "Resume",
    position: [3.0, 1.6, 2.8],
    action: { kind: "route", href: "/resume" },
  },
];

// About panel copy — drafted from HASIBUL_ISLAM_RESUME.md, tone-humanized per
// the humanizer skill (no em-dash overuse, no rule-of-three, no vague
// attributions). Owner edits later.
export const ABOUT_COPY = `Senior full-stack engineer with 7+ years of production Node.js, NestJS and TypeScript work. Most of my career has been remote and contract work with teams in Israel, Italy, Algeria, Saudi Arabia and Bangladesh.

I own delivery end to end: schema, API, background workers, Docker/AWS, CI/CD and observability. Recent win — cut a hot-path list API from ~200 ms to ~20 ms with compound indexing, single-join rewrites, cache-aside and DTO projection.

I fold LLM + RAG, MCP and agentic-skills features into real user-facing paths, without the demo-project feel.`;

export type ProjectEntry = {
  title: string;
  role: string;
  href: string;
  blurb: string;
};

// ponytail: hardcoded 4 entries. Move to a Neon `projects` table when this
// list needs owner-edited CRUD, not before.
export const PROJECTS: ProjectEntry[] = [
  {
    title: "api-latency-case-study",
    role: "Author",
    href: "https://github.com/devhasibulislam/api-latency-case-study",
    blurb:
      "200 ms → 20 ms hot-path list API. Compound indexing, single-join rewrites, cache-aside, DTO projection. Autocannon benchmarks + green CI on GitHub.",
  },
  {
    title: "nestjs-multitenant-starter",
    role: "Author",
    href: "https://github.com/devhasibulislam/nestjs-multitenant-starter",
    blurb:
      "Postgres Row-Level Security for multi-tenant SaaS. Eight integration tests that actively try to leak data across tenants — all green.",
  },
  {
    title: "webcrawler.buzz",
    role: "Backend + infra",
    href: "https://webcrawler.buzz",
    blurb:
      "Public SEO audit tool on BullMQ + PostgreSQL. Now shipping an MCP surface so Claude and other LLM agents can drive audits directly.",
  },
  {
    title: "messagemind.ai",
    role: "Sr. Backend Engineer",
    href: "https://messagemind.ai/",
    blurb:
      "WhatsApp / Messenger / Instagram / web-chat pipeline serving 5,000+ companies. Meta Business Partner, GDPR-hosted in Frankfurt.",
  },
];
