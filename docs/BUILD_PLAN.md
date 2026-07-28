# Build plan — resume-from-anywhere state file

This file is the **single source of truth for day-to-day progress**. When you sit down at a new machine, read this file top to bottom before anything else. Update the checkboxes and the "Current focus" line at the end of every meaningful work session.

`PROJECT_CONTEXT.md` is the frozen *spec* — this file is the *plan*.

---

## Resume from another device

1. `git clone https://github.com/devhasibulislam/portfolio.git && cd portfolio`
2. `cp .env.example .env.local` and paste values from your password manager. Values you need:
   - `DATABASE_URL` — pooled Neon connection (host must contain `-pooler`)
   - `NEON_API_KEY` — Neon Management API personal key
   - `NEON_AUTH_BASE_URL` — Neon Console → Project → Branch → Auth → Configuration → Auth URL
   - `NEON_AUTH_COOKIE_SECRET` — 32+ chars (regenerate with `openssl rand -base64 48` if you never saved it)
   - `DASHBOARD_ALLOWED_EMAIL` — `devhasibulislam@gmail.com`
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `VERCEL_TOKEN`
3. `npm install`
4. `npm run dev`
5. Open VS Code — the six MCPs in `.vscode/mcp.json` auto-load. Approve them when prompted.

---

## Provisioning still to do (blocks Phase 1 auth work)

- [ ] **Enable Neon Auth in the console**: https://console.neon.tech → project → branch → **Auth** → **Enable Auth** → **Configuration** tab → copy the Auth URL → paste as `NEON_AUTH_BASE_URL` in `.env.local`.
- [ ] **Create the sole user in Neon Auth** (either via console UI or one-time seed script) — `devhasibulislam@gmail.com` / `Hasib@123`.
- [ ] **Disable sign-up** in the Neon Auth project settings.
- [ ] Confirm the Neon Postgres database is at least the pooled tier (free is fine).

---

## Phase 0 — Foundation

Scaffold that everything else builds on. All items are project-scoped (nothing in `~/`).

- [x] Next 16 + TS strict + Tailwind v4 + App Router + Turbopack + `src/` layout scaffolded
- [x] Reference photo relocated to `public/brand/reference.jpg`; palette baked into `src/app/globals.css`
- [x] `.env.local` written with all current secrets; `.env.example` committed as schema
- [x] `.gitignore` patched with `!.env.example`
- [x] Cookie-based **i18n** (`next-intl`) — 5 locales (`en`, `bn`, `ar`, `ur`, `he`) with RTL map; server-readable at SSR; message stubs in `messages/*.json`; wired into `layout.tsx` via `<html lang dir>`
- [x] Cookie-based **theme** — `data-theme` set server-side from cookie; dark-first per §8
- [x] **Drizzle + `@neondatabase/serverless`** wired (pooled connection enforced with a startup warning if the URL is unpooled); `drizzle.config.ts` committed
- [x] **Neon Auth** (`@neondatabase/auth`, Managed Better Auth) — server + client instances, `app/api/auth/[...path]/route.ts` handler
- [x] `proxy.ts` (Next 16 middleware) — protects `/dashboard/:path*`, redirects to `/login`
- [x] `src/app/dashboard/layout.tsx` enforces single-user email whitelist (defence-in-depth)
- [x] `src/app/login/` — page + server action + client form (Neon Auth email/password)
- [x] `.vscode/mcp.json` — six MCPs (shadcn, Next.js, Cloudinary, Vercel, Playwright, Chrome DevTools) — **project-scoped**
- [x] `.vscode/settings.json` — TS SDK pin, format-on-save, ESLint fix on save
- [x] `components.json` + `src/lib/utils.ts` — shadcn wired (add components via `npx shadcn@latest add <name>`)
- [x] `src/schemas/index.ts` — placeholder for shared Zod schemas (one-per-entity per §14)
- [ ] Husky + lint-staged + `pre-commit` (`tsc --noEmit && next lint --fix`) + `pre-push` (`next build`)
- [ ] `.github/instructions/*.instructions.md` — Copilot repo-scoped skills:
  - [ ] `drizzle-neon.instructions.md`
  - [ ] `blog-schemas.instructions.md`
  - [ ] `rtl-logical-props.instructions.md`
- [ ] `README.md` — quickstart + repo layout
- [ ] First `next build` passes with no errors
- [ ] First commit + push to `origin/master`

### Known Phase 0 TODOs deferred into Phase 1

- **Session-only auth cookie**: `@neondatabase/auth` sets a persistent cookie by default. §11 requires a browser-session cookie (dies on tab close). Implement by stripping `Max-Age` / `Expires` from the `Set-Cookie` written by the auth handler — likely via a response-transforming wrapper in `src/app/api/auth/[...path]/route.ts` or a `proxy.ts` post-hook. Tracked here so it isn't forgotten.
- **First-visit theme = system preference**: currently defaults to dark. Add a no-flash inline script in `layout.tsx` that reads `prefers-color-scheme` when the theme cookie is absent, sets `data-theme` before hydration.

---

## Phase 1 — The dashboard (`/dashboard`)

Content management. Nothing else can be demoed without this.

- [ ] Seed Neon Auth with the sole user (see Provisioning above)
- [ ] Session-only cookie override (see Phase 0 deferred TODOs)
- [ ] Real login UI polish (shadcn `Card` + `Input` + `Button`)
- [ ] Drizzle schema: `posts`, `categories`, `tags`, `posts_tags`, `media`, `media_uses`, `resumes`, `links`
- [ ] Zod schemas for each entity in `src/schemas/*.ts` (client + server), enforcing §5 field lengths
- [ ] Dashboard shell: sidebar nav, breadcrumbs, sign-out
- [ ] **Posts CRUD** — Tiptap toolbar locked to §5 subset; publish/draft toggle; auto-slug + slug edit
- [ ] **Categories CRUD** — in-use guard on delete
- [ ] **Tags CRUD** — in-use guard on delete; 5–8 cap enforced at post level
- [ ] **Media library** — Cloudinary uploader with 1MB client-side reject, mandatory 1.91:1 crop, reuse-vs-upload picker, in-use tracking, "in use" vs "unused" filter, blocked-delete on in-use
- [ ] **Resume manager** — upload history, single-active radio, active PDF served on `/resume`
- [ ] **Links manager** — small CRUD for `/links` entries
- [ ] All mutations call `revalidateTag()` for the correct route family (§13)
- [ ] Middleware smoke-test: cookie-tampered session with a foreign email is signed out

---

## Phase 2 — Public blog + SEO surface

- [ ] Shared cursor-pagination hook (`useCursor<Item>(filter)`) — one implementation, three consumers
- [ ] `/blog` list w/ IntersectionObserver infinite scroll
- [ ] `/blog/[slug]` w/ `generateMetadata`, JSON-LD `Article`, canonical, hreflang
- [ ] `/blog/category/[slug]` real SSG page
- [ ] `/blog/tag/[slug]` real SSG page
- [ ] `next/og` fallback OG generator when a post has no cover image
- [ ] `sitemap.xml`, `robots.txt`, `llms.txt`, `hreflang` for all 5 locales

---

## Phase 3 — `/resume` and `/links`

- [ ] `/resume` — embed active PDF, download button, nothing else
- [ ] `/links` — read from the `links` table; small Linktree-style page

---

## Phase 4 — The `/` experience

- [ ] Capability detector (WebGL renderer + `deviceMemory` + primary-input) — runs before any Three.js imports
- [ ] `next/dynamic({ ssr: false })` for Three.js/R3F — verify Three not shipped to mobile in Network tab
- [ ] Procedural `GeometricForms` — no `.glb` pipeline
- [ ] Hotspot system + GSAP camera choreography
- [ ] `LinksPortal` hotspot → `/links`
- [ ] `MobileFallbackExperience` — separate tree, GSAP + Framer only

---

## Phase 5 — Polish

- [ ] Neon Management API dashboard widget (optional; §11)
- [ ] Lighthouse pass
- [ ] Cache-tag audit
- [ ] Deploy to Vercel, wire env, sanity-check every route

---

## Current focus

**Phase 0 — closing out.** Remaining work in this phase: Husky hooks, the three Copilot instruction files, README, and first `next build` verification before push.

Last touched: 2026-07-28 (Phase 0 initial commit)
