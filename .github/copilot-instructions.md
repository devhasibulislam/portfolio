# Copilot instructions — devhasibulislam/portfolio

**Read these two files before proposing or writing any code:**

1. [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) — the frozen spec. All architectural decisions live here, sectioned. If a decision seems ambiguous, cite the section number in your response before choosing.
2. [`docs/BUILD_PLAN.md`](../docs/BUILD_PLAN.md) — the current-state progress ledger. Read the **Current focus** block at the bottom to know what phase we're in and what's next.

## Non-negotiable stack

Next 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Drizzle + Neon Postgres (pooled) · Neon Auth (`@neondatabase/auth`, Managed Better Auth) · Cloudinary · next-intl · GSAP + Framer Motion + Three.js/R3F (Phase 4).

**Never introduce**: Prisma, TypeORM, MUI, Redux/RTK, GraphQL, Sanity, Contentful, MDX-based CMS, other 3D engines. These are the owner's *day-job* tools and are explicitly out-of-scope for this repo (see §2, §15, §16). They may appear only as *content* (bio text), never as `package.json` dependencies.

## Engineering discipline

- **No duplicated logic** (§14). One Zod schema per entity in `src/schemas/`, imported by both client forms and server actions. One cursor-pagination hook parameterised by filter. One image picker. Before adding any function/component, check whether an existing one can be extended.
- **No per-request DB writes on public routes** (§13). Writes only happen in dashboard server actions. After every mutation, call `revalidateTag()` for the affected route family — never rely on time-based revalidation.
- **Cursor-based pagination only.** No `OFFSET`, no numbered UI ("1 2 3 4").
- **Neon connection**: always import `db` from `@/lib/db/client`. Never call `neon()` or `drizzle()` elsewhere.
- **RTL**: use logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`) — never `ml-`, `pl-`, `left-`, `text-left`. Enforced by `.github/instructions/rtl-logical-props.instructions.md`.
- **Blog field lengths**: SEO-critical, enforced by `.github/instructions/blog-schemas.instructions.md` and shared Zod schemas.

## Auth reminders

- Dashboard route is `/dashboard`. Login route is `/login` (top-level, not nested). Neither is linked from public UI.
- Single user only: `devhasibulislam@gmail.com`. Whitelist lives in `proxy.ts` matcher + `src/app/dashboard/layout.tsx` + `src/app/login/actions.ts`.
- Session-cookie only (dies on tab close). No 2FA, no sign-up page, no forgot-password page.

## When in doubt

- Cite the PROJECT_CONTEXT section number(s) your suggestion depends on.
- Prefer the shorter, more standard solution. The owner's rule of thumb: "the laziest solution that actually works."
- If a change touches more than one file, update `docs/BUILD_PLAN.md`'s **Current focus** block in the same commit.
