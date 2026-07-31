# Agent instructions — devhasibulislam/portfolio

> This file is the single source of truth for AI-agent behaviour in this repo.
> It is mirrored at the repo root as `AGENTS.md` and `CLAUDE.md` (symlinks) so
> that GitHub Copilot, OpenAI Codex/Cursor, and Claude Code all discover it
> under their expected filename. Edit this file — the mirrors auto-update.
>
> **Sync rule**: when adding a skill to `.agents/skills/`, an instructions
> file to `.github/instructions/`, or a prompt to `.github/prompts/`, update
> the relevant section of this file in the same commit. Run `/audit-agents`
> if unsure whether anything drifted.

**Read these two files before proposing or writing any code:**

1. [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) — the frozen spec. All architectural decisions live here, sectioned. If a decision seems ambiguous, cite the section number in your response before choosing.
2. [`docs/BUILD_PLAN.md`](../docs/BUILD_PLAN.md) — the current-state progress ledger. Read the **Current focus** block at the bottom to know what phase we're in and what's next.

## Non-negotiable stack

Next 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Drizzle + Neon Postgres (pooled) · Neon Auth (`@neondatabase/auth`, Managed Better Auth) · Cloudinary · next-intl · GSAP + Framer Motion + Three.js/R3F (Phase 4).

**Never introduce**: Prisma, TypeORM, MUI, Redux/RTK, GraphQL, Sanity, Contentful, MDX-based CMS, other 3D engines. These are the owner's _day-job_ tools and are explicitly out-of-scope for this repo (see §2, §15, §16). They may appear only as _content_ (bio text), never as `package.json` dependencies.

## Engineering discipline

- **No duplicated logic** (§14). One Zod schema per entity in `src/schemas/`, imported by both client forms and server actions. One cursor-pagination hook parameterised by filter. One image picker. Before adding any function/component, check whether an existing one can be extended.
- **No per-request DB writes on public routes** (§13). Writes only happen in dashboard server actions. After every mutation, call `revalidateTag()` for the affected route family — never rely on time-based revalidation.
- **Cursor-based pagination only.** No `OFFSET`, no numbered UI ("1 2 3 4").
- **Neon connection**: always import `db` from `@/lib/db/client`. Never call `neon()` or `drizzle()` elsewhere. Full ruleset in [`.github/instructions/drizzle-neon.instructions.md`](instructions/drizzle-neon.instructions.md) (auto-loaded via `applyTo`).
- **RTL**: use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`) — never `ml-`, `pl-`, `left-`, `text-left`. Enforced by `.github/instructions/rtl-logical-props.instructions.md`.
- **Blog field lengths**: SEO-critical, enforced by `.github/instructions/blog-schemas.instructions.md` and shared Zod schemas.

## Auth reminders

- Dashboard route is `/dashboard`. Login route is `/login` (top-level, not nested). Neither is linked from public UI.
- Single user only: `devhasibulislam@gmail.com`. Whitelist lives in `proxy.ts` matcher + `src/app/dashboard/layout.tsx` + `src/app/login/actions.ts`.
- Session-cookie only (dies on tab close). No 2FA, no sign-up page, no forgot-password page.

## Skills library — consult BEFORE writing code

Before answering any coding request, scan [`.agents/skills/`](../.agents/skills/) for a skill whose `SKILL.md` frontmatter `description` matches the topic. If one applies, read that `SKILL.md` in full (and any files it links to under `references/`, `assets/`, or `rules/`) and follow its guidance. This overrides your default knowledge if there's a conflict — these skills capture project-verified best practice.

Rough map of when to reach for which family (not exhaustive — the `description` in each `SKILL.md` is authoritative):

| Task involves…                                                                                                                             | Skill(s) to consult                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| shadcn add / registry / MCP / components.json                                                                                              | `shadcn/SKILL.md`                                                                                                                                      |
| Next.js App Router basics, server actions, RSC                                                                                             | `nextjs-app-router-fundamentals/`, `nextjs-developer/`, `nextjs-react-typescript/`                                                                     |
| `"use cache"`, cacheTag, revalidateTag, Suspense boundaries, PPR                                                                           | `nextjs-cache-architecture/SKILL.md` (project-critical for §13)                                                                                        |
| Metadata, JSON-LD, sitemap, robots, hreflang                                                                                               | `nextjs-seo/SKILL.md`                                                                                                                                  |
| Cloudinary uploads, transforms, `<CldImage>`, OG images                                                                                    | `cloudinary-next/`, `cloudinary-docs/`, `cloudinary-transformations/`, `cloudinary-react/`                                                             |
| Neon connection, branches, egress, object storage, AI gateway                                                                              | `neon/`, `neon-postgres/`, `neon-postgres-branches/`, `neon-postgres-egress-optimizer/`, `neon-object-storage/`, `neon-ai-gateway/`, `neon-functions/` |
| Temporary/throwaway Postgres for prototyping (`claimable-postgres/`)                                                                       | ❌ Out of scope — we use a permanent Neon project. Skill exists on disk but is not to be consulted.                                                    |
| GSAP — timelines, ScrollTrigger, React integration, perf                                                                                   | `gsap-core/`, `gsap-timeline/`, `gsap-scrolltrigger/`, `gsap-react/`, `gsap-performance/`, `gsap-plugins/`, `gsap-utils/`, `gsap-frameworks/`          |
| Three.js / R3F (Phase 4) — geometry, lighting, materials, shaders, postprocessing, loaders, interaction, animation, textures, fundamentals | `threejs-fundamentals/`, `threejs-geometry/`, `threejs-materials/`, `threejs-textures/`, `threejs-lighting/`, `threejs-shaders/`, `threejs-postprocessing/`, `threejs-loaders/`, `threejs-interaction/`, `threejs-animation/` |
| Vercel deploy, edge, optimization, React patterns for Vercel                                                                               | `deploy-to-vercel/`, `vercel-optimize/`, `vercel-react-best-practices/`                                                                                |
| Tailwind v4 advanced layouts, subgrid, container queries                                                                                   | `tailwindcss-advanced-layouts/SKILL.md`                                                                                                                |
| Visual design taste, hero sections, typography systems                                                                                     | `design-taste-frontend/`, `frontend-design/`, `high-end-visual-design/`, `web-design-guidelines/`, `canvas-design/`                                    |
| Radix → Base UI migration references (if we ever swap primitives)                                                                          | `migrate-radix-to-base/`                                                                                                                               |
| De-AI-ify English prose (blog copy, About text) — detects em-dash overuse, rule of three, vague attributions, filler phrases per §16 tone | `humanizer/SKILL.md` — run on `/blog` post drafts and About/bio text before publishing                                                                  |

**Rule**: if you would have answered from generic knowledge and a matching `SKILL.md` exists, you MUST cite the skill you consulted in your response ("Consulted `.agents/skills/<name>/SKILL.md`") so the human can verify the guidance is being applied. If no skill matches, proceed with generic knowledge — do not fabricate a citation.

## Slash prompts — user-invoked, not auto-loaded

These live in `.github/prompts/` and are typed into Copilot Chat as `/name`:

- **`/phase-status`** — read `docs/BUILD_PLAN.md` and report the current phase, last commit SHA, next actionable checkbox, and any drift between the plan and the actual repo state. Run at the start of a session, especially on a new machine.
- **`/rtl-audit`** — grep for banned physical CSS/Tailwind properties per [`instructions/rtl-logical-props.instructions.md`](instructions/rtl-logical-props.instructions.md). Run before shipping any UI phase.
- **`/audit-agents`** — cross-reference `.agents/skills/`, `.github/instructions/`, and `.github/prompts/` against this file to catch drift. Run at the end of each phase, after any `npx skills add`, and any time this file feels stale.

## When in doubt

- Cite the PROJECT_CONTEXT section number(s) your suggestion depends on.
- Prefer the shorter, more standard solution. The owner's rule of thumb: "the laziest solution that actually works."
- If a change touches more than one file, update `docs/BUILD_PLAN.md`'s **Current focus** block in the same commit.
