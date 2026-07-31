# Build plan — resume-from-anywhere state file

This file is the **single source of truth for day-to-day progress**. When you sit down at a new machine, read this file top to bottom before anything else. Update the checkboxes and the "Current focus" line at the end of every meaningful work session.

`PROJECT_CONTEXT.md` is the frozen _spec_ — this file is the _plan_.

---

## Resume from another device

1. `git clone https://github.com/devhasibulislam/portfolio.git && cd portfolio`
2. `cp .env.example .env.local` and fill values from your password manager. Values you need:
   - `DATABASE_URL` — pooled Neon connection (host must contain `-pooler`)
   - `NEON_API_KEY` — Neon Management API personal key
   - `NEON_AUTH_BASE_URL` — Neon Console → Project → Branch → Auth → Configuration → Auth URL
   - `NEON_AUTH_COOKIE_SECRET` — 32+ chars (regenerate with `openssl rand -base64 48` if you never saved it)
   - `DASHBOARD_ALLOWED_EMAIL` — `devhasibulislam@gmail.com`
   - `SEED_USER_NAME` / `SEED_USER_PASSWORD` — consumed by `npm run seed:user` only
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `VERCEL_TOKEN`
3. `npm install`
4. `npm run seed:user` — creates the sole dashboard user in Neon Auth (idempotent; no-op if user exists)
5. `npm run dev`
6. **For the graphify MCP** (optional but useful): install the graphify Python tool with the MCP extra and pin `mcp<2`:
   ```bash
   python3 -m pip install --user --break-system-packages "graphifyy[mcp]" "mcp<2"
   ```
   Then run `/graphify .` once in Copilot Chat to build `graphify-out/graph.json` — the MCP server reads from this file.
7. Open VS Code — the **eight** MCPs in `.vscode/mcp.json` auto-load. On first start you'll be prompted **four times** (once each): Cloudinary API key, Cloudinary API secret, Neon API key, Vercel token. Paste values from `.env.local`. VS Code stores them in its OS keychain — you're never asked again on that machine.

---

## Provisioning still to do (blocks Phase 1 auth work)

- [x] **Enable Neon Auth in the console**: https://console.neon.tech → project → branch → **Auth** → **Enable Auth** → **Configuration** tab → copy the Auth URL → paste as `NEON_AUTH_BASE_URL` in `.env.local`.
- [x] **Enable Email & Password sign-up** in the Neon Auth Configuration tab. (Was blocking the seed script with `EMAIL_AND_PASSWORD_SIGN_UP_IS_NOT_ENABLED`. Consider disabling it again after seeding, since the app-level whitelist protects the dashboard either way — PROJECT_CONTEXT §11.)
- [x] **Delete the empty-password user** created via the Console UI (Console can't set passwords, only names).
- [ ] **Seed the sole user**: `npm run seed:user` — waiting for confirmation that `✓ Created (200)` was printed.
- [ ] **~~Disable sign-up in Neon Auth project settings~~** — not currently possible (Beta limitation, see PROJECT_CONTEXT §11). Revisit once Neon ships restricted-signup support.
- [x] Neon Postgres pooled connection verified (free tier).

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
- [x] `.vscode/mcp.json` — **seven MCPs** (shadcn, next-devtools, Cloudinary, Neon, Vercel, Playwright, Chrome DevTools) — **project-scoped**; API-key MCPs use `${input:...}` prompted secrets (paste-once-per-machine, stored in VS Code secret storage)
- [x] `.vscode/settings.json` — TS SDK pin, format-on-save, ESLint fix on save
- [x] `components.json` + `src/lib/utils.ts` — shadcn wired (add components via `npx shadcn@latest add <name>`)
- [x] `src/schemas/index.ts` — placeholder for shared Zod schemas (one-per-entity per §14)
- [x] Husky + lint-staged + `pre-commit` (`lint-staged`) + `pre-push` (`typecheck`)
- [x] `.github/instructions/*.instructions.md` — Copilot repo-scoped skills:
  - [x] `drizzle-neon.instructions.md`
  - [x] `blog-schemas.instructions.md`
  - [x] `rtl-logical-props.instructions.md`
- [x] `.github/copilot-instructions.md` — top-level agent instructions loaded on every chat turn; includes `.agents/skills/` auto-consult directive
- [x] `AGENTS.md` + `CLAUDE.md` — root symlinks pointing at `.github/copilot-instructions.md` so Codex/Cursor/Claude Code all read the same source of truth
- [x] `.github/prompts/` — slash-commands available in Copilot Chat:
  - [x] `/phase-status` — report current phase, last commit, next actionable item
  - [x] `/rtl-audit` — grep for banned physical CSS/Tailwind properties
- [x] `.agents/skills/` — 46 installable skill packs (Cloudinary, Neon, Next.js, shadcn, GSAP, Three.js, Vercel, Tailwind, design taste) auto-installed via `npx skills add`, referenced from top-level Copilot instructions
- [x] `scripts/seed-user.ts` + `npm run seed:user` — one-shot user seeder that bypasses the Neon Auth Console's no-password admin-create limitation
- [x] `README.md` — quickstart + repo layout
- [x] First `next build` passes with no errors
- [x] First commit + push to `origin/master`

### Known Phase 0 TODOs deferred into Phase 1

- **Session-only auth cookie**: `@neondatabase/auth` sets a persistent cookie by default. §11 requires a browser-session cookie (dies on tab close). Implement by stripping `Max-Age` / `Expires` from the `Set-Cookie` written by the auth handler — likely via a response-transforming wrapper in `src/app/api/auth/[...path]/route.ts` or a `proxy.ts` post-hook. Tracked here so it isn't forgotten.
- **First-visit theme = system preference**: currently defaults to dark. Add a no-flash inline script in `layout.tsx` that reads `prefers-color-scheme` when the theme cookie is absent, sets `data-theme` before hydration.

---

## Phase 1 — The dashboard (`/dashboard`)

Content management. Nothing else can be demoed without this.

- [x] Seed Neon Auth with the sole user (see Provisioning above)
- [x] Session-only cookie override (see Phase 0 deferred TODOs)
- [x] Real login UI polish (shadcn `Card` + `Input` + `Button`)
- [x] Drizzle schema: `posts`, `categories`, `tags`, `posts_tags`, `media`, `resumes`, `links` (no `media_uses` — runtime `SELECT ... WHERE cover_media_id = ?` covers the in-use check)
- [x] Zod schemas for each entity in `src/schemas/*.ts` (client + server), enforcing §5 field lengths
- [x] Dashboard shell: sidebar nav, breadcrumbs, sign-out
- [x] **Posts CRUD** — Tiptap toolbar locked to §5 subset; publish/draft toggle; auto-slug + slug edit
- [x] **Categories CRUD** — in-use guard on delete
- [x] **Tags CRUD** — in-use guard on delete; 5–8 cap enforced at post level
- [x] **Media library** — Cloudinary uploader with 1MB client-side reject, 1.91:1 delivery-time crop (`c_fill,g_auto` at 1200×630 via CldImage — not physical crop), reuse-vs-upload picker, in-use tracking, "in use" vs "unused" filter, blocked-delete on in-use
- [x] **Resume manager** — upload history, single-active radio, active PDF served on `/resume`
- [x] **Links manager** — small CRUD for `/links` entries
- [x] All mutations call `updateTag()` for the correct route family (§13) — Next 16 renamed `revalidateTag` inside server actions to `updateTag` for read-your-writes semantics
- [x] Middleware smoke-test: `dashboard/layout.tsx` re-checks `session.user.email !== DASHBOARD_ALLOWED_EMAIL` and calls `auth.signOut()` before redirecting to `/login?denied=1`. Verified by code review — cookie tampering can't forge the email claim because the session cookie is signed with `NEON_AUTH_COOKIE_SECRET`, but the layout guarantees defense-in-depth if the signature check ever regressed.

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

**Phase 1 shipped ✅** — the dashboard CMS is complete. Every entity from PROJECT_CONTEXT §5 has a working CRUD surface, session-only cookies land per §11, Cloudinary uploads are signed, and every mutation calls `updateTag()` (Next 16's server-action equivalent of `revalidateTag`) for the correct cache family.

**What Phase 1 shipped this session:**

- Login polish + dashboard shell (collapsible sidebar, breadcrumb, sign-out, sonner top-right)
- Categories + Tags CRUD via a shared `SlugEntityTable` (§14: one component, two entities)
- Media library with signed Cloudinary uploads, 1MB reject, filter tabs, delete guard
- Posts CRUD with a Tiptap editor locked to the §5 subset, category/tag/cover pickers, publish/draft flow, auto-slug
- Resume manager with single-active radio and PDF-only uploads
- Links CRUD with sort order

**Runtime workarounds baked in** (local dev only, transparent on Vercel):

- `drizzle.config.ts` resolves DNS to IPv4 via `getent ahostsv4` because `pg`'s `family:4` is silently ignored (see `node_modules/pg/lib/connection.js:44`).
- `src/lib/db/client.ts` uses `pg` locally (TCP:5432) and `@neondatabase/serverless` (HTTP) on Vercel — Node 24 + undici currently fails to reach Neon over IPv6 and can't fall back to IPv4 cleanly.

**Next up — Phase 2 opening moves** (in order):

1. Shared `useCursor<Item>(filter)` hook — one implementation, three consumers per §14.
2. `/blog` list with cursor-based infinite scroll (no offset pagination).
3. `/blog/[slug]` with `generateMetadata` + Article JSON-LD + canonical + hreflang.
4. `/blog/category/[slug]` and `/blog/tag/[slug]` — real server-rendered SEO pages, not client filters.
5. `next/og` fallback OG image when a post has no cover.
6. `sitemap.xml`, `robots.txt`, `llms.txt` — hreflang for all 5 locales.

Last touched: 2026-07-31 (Phase 1 complete — Resume + Links + BUILD_PLAN sync)
