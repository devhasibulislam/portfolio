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
- **`RootLayout` blocks the render tree under Cache Components**: With `experimental.cacheComponents: true` (enabled in Phase 2 so `updateTag()` mutations invalidate readers), `RootLayout` accesses `cookies()` via `getLocale()`/`getTheme()`/`getMessages()` outside a `<Suspense>` boundary. Next 16 flags this as a `blocking-route` warning: `/blog` renders correctly but the top-level tree can't be prerendered. Fix by pushing the dynamic bits (locale/theme/messages/NextIntlClientProvider) into a client boundary or a Suspense-wrapped server child so `<html lang dir data-theme>` still renders statically. Non-critical — blog is functional — but blocks Vercel-side static generation for the whole app.

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
- [x] Theme toggle (Light / Dark / System) in the dashboard header — mirrors onto `<html data-theme>` synchronously + persists cookie server-side

---

## Phase 1.5 — Dashboard polish (owner feedback)

Ship-blockers surfaced by first real use of the dashboard. Group by area; each item is a small change on top of the Phase 1 code. **Discussion still open — the owner will pick priority/scope before we start writing.**

### Overview (dashboard home)

- [x] **Cards** — the whole card is already a `<Link>`; drop the arrow icon since redundant. Add a **count badge** in the top-right corner (icon stays top-left). E.g. `Posts (05)`, `Media (12)`. Format as two digits with a leading zero.

### Posts — list view

- [x] **Status column** = a real toggle (shadcn `Switch` in a `Tooltip`) that flips draft ↔ published in place via a small server action + `updateTag('posts')`. Optimistic UI + toast on error.

### Posts — create/edit form

- [x] **Cover image**: replace the current MediaPicker with a single reusable modal that combines _pick-from-existing_ **and** _upload-new_ (Cloudinary widget) inside the same surface. Applies to the Media page too where sensible.
- [x] **Free cropper** — display the intrinsic resolution + let the user drag/reposition a crop rect at any target ratio. Used by both Cover picker and inline Body images. Ships as a shared component (`src/components/dashboard/image-cropper.tsx`).
- [x] **Category select** — full-width to match the tags row.
- [x] **Tags picker** — redesign. Current chip-plus-search UI feels utilitarian; move to something with better discovery and hover states (candidate: shadcn Command palette style with grouped suggestions, keyboard-navigable).
- [x] **Tiptap toolbar** — sticky **within** the editor container as the body scrolls, not sticky to the viewport. Use `position: sticky; top: 0` inside the scrollable editor pane.
- [x] **Tiptap active state** — active-mark styling should only reflect _the current selection inside the editor_. Currently when focus leaves the editor the toolbar keeps `H2`/`Link` lit. Fix by binding to `editor.state.selection` + a `focus` listener; clear active classes when the editor loses focus.
- [x] **Tiptap Image tool** — replace the `window.prompt("Image URL")` with the same reusable pick-or-upload modal used by the cover, backed by the same free cropper. Multi-file upload, `jpg|jpeg|png|gif|webp`, each ≤1MB (client-side reject).
- [ ] **Clarification — social preview / SEO fields.** Current form has `meta_description` (Google snippet, 120–160 chars) and `excerpt` (listing card, 200–300). Social preview reuses the cover image at 1200×630 via `next/og`. Per PROJECT_CONTEXT §5 there is no separate OG title / OG description — Google, Facebook, LinkedIn, Twitter all fall back to `<title>` + `meta_description` + the OG image, so the current three fields cover it. Confirm before we build anything extra.

### Categories & Tags

- [x] **Edit action** — the whole row is currently clickable (opens the edit dialog). Owner wants an **explicit pencil icon** next to the delete icon so it is discoverable. Row-click stays as a shortcut.
- [x] **Delete button** — currently opens a dialog that says "Blocked". Change to **disable the button entirely** with a tooltip explaining why (e.g. "In use by 3 posts") when `postCount > 0`.

### Media

- [x] **Delete disabled when `inUse === true`** — right now the button opens a "blocked" alert dialog. Same fix as above: disable the button + tooltip.
- [x] **Lightbox** — click a tile to open a large-size preview modal. Shows original resolution + file size; secondary "Copy public_id" and "Copy URL" buttons.

### Resume

- [x] **Explicit active/inactive toggle button** — the native radio is not discoverable enough. Use a shadcn `Switch` or a clear "Set active" button per row.
- [x] **Confirm behaviour**: activating a new resume already deactivates the previously-active one (partial-unique index + two-step `UPDATE`). The first-uploaded resume already defaults to `is_active = true`. Both behaviours exist server-side but were invisible in the UI — the toggle redesign fixes that.

### Links

- [ ] **Remove entirely.** Drop the DB table (`links`), the `linkInput` Zod schema, the `/dashboard/links` page + form + query + server actions, the nav entry, the cache tag `tag.links()`, and the placeholder for the public `/links` page (Phase 3). Ship a Drizzle migration that drops the table.

### Cross-cutting

- [x] **Full device responsive audit** — every dashboard page at 375 / 768 / 1024 / 1280+. Playwright screenshot each width and fix overflow / hidden controls. _(Bottom nav bar on small/mid devices — cut by the owner. The collapsible sidebar handles mobile via SidebarProvider's built-in drawer.)_ Static Tailwind-class audit (agent-driven) surfaced four findings; all four fixed 2026-08-02: media-grid delete button now `opacity-100 md:opacity-0` so touch users can reach it; media filename gets `min-w-0 flex-1` so it truncates cleanly next to size; `AppSidebar` closes the mobile drawer on nav-link click via `useSidebar().setOpenMobile`; leftover `border-l` in Tiptap toolbar divider swapped to `border-s`.

---

## Phase 2 — Public blog + SEO surface

- [x] Shared cursor-pagination hook (`useCursor<Item>(filter)`) — one implementation, three consumers
- [x] `/blog` list w/ IntersectionObserver infinite scroll
- [x] `/blog/[slug]` w/ `generateMetadata`, JSON-LD `Article`, canonical, hreflang
- [x] `/blog/category/[slug]` real SSG page
- [x] `/blog/tag/[slug]` real SSG page
- [x] `next/og` fallback OG generator when a post has no cover image
- [x] `sitemap.xml`, `robots.txt`, `llms.txt`, `hreflang` for all 5 locales

---

## Phase 3 — `/resume`

- [x] `/resume` — embed active PDF, download button, nothing else. (`/links` was dropped in Phase 1.5.)

---

## Phase 4 — The `/` experience

- [x] Capability detector (WebGL renderer + `deviceMemory` + primary-input) — runs before any Three.js imports
- [x] `next/dynamic({ ssr: false })` for Three.js/R3F — verify Three not shipped to mobile in Network tab
- [x] Procedural `GeometricForms` — no `.glb` pipeline
- [x] Hotspot system + GSAP camera choreography
- [x] `MobileFallbackExperience` — separate tree, GSAP + Framer only

_(The `LinksPortal` hotspot was dropped when Links was removed in Phase 1.5.)_

---

## Phase 5 — Polish

- [ ] ~~Neon Management API dashboard widget~~ — marked optional in §11; skipping unless owner asks.
- [x] Lighthouse pass (dev-mode indicative; a real audit needs a green prod build — see blocker below). Desktop scores at 2026-08-02: `/` A11y 100 / BP 96 / SEO 100 / Agentic 100. `/blog` A11y 100 / BP 96 / SEO 92 / Agentic 67. `/resume` A11y 100 / BP 96 / SEO 100 / Agentic 89. Fixes shipped this pass: added `metadataBase` to root layout (so `alternates.canonical` resolves to an absolute URL — was the `/blog` SEO 92 hit), matched `SiteHeader` logo `aria-label` to its visible text "Hasibul Islam — home" (was `label-content-name-mismatch`). Remaining audit fails all trace to the RootLayout blocking-route issue (see pre-deploy blocker) plus one llms.txt "recommendations" nit with no actionable rule.
- [x] Cache-tag audit. Paired every mutation server action with a public reader tag:
  - `posts` create/update/delete → `tag.posts()` + `tag.post(slug)` — readers `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`.
  - `categories`/`tags` create/update/delete → `tag.categories()`/`tag.tags()` + `tag.posts()` (cascades because post cards render chip).
  - `resume` upload/toggle/delete → `tag.resumes()` + `tag.activeResume()` — reader `/resume`.
  - `media` create/delete → `tag.media()` (no public reader; media is URL-embedded in post bodies, invalidation via `tag.posts()`).
  - **One gap fixed**: `/blog/[slug]` was only tagged with `tag.post(slug)`, so a category/tag rename would stale the individual post card. Added `tag.posts()` to the reader.
- [ ] Deploy to Vercel — deferred; owner will schedule with discussion.

### Pre-deploy blocker (concrete)

~~`next build` fails with `HANGING_PROMISE_REJECTION`...~~ **Resolved 2026-08-02.** RootLayout is now a synchronous server component that renders `<html lang="en" dir="ltr" data-theme="dark">` defaults; a pre-hydration inline script reads the `locale` and `theme` cookies and applies them to the `<html>` element before React hydrates (same technique as the existing theme no-flash script). All async work (`getLocale()`, `getMessages()`, `<NextIntlClientProvider>`, `<SiteHeader>`) moved into `LocalizedShell`, an async child wrapped in `<Suspense fallback={null}>`. Build now succeeds — every public route reports as Partial Prerender (◐): static shell + streamed dynamic body. Dev-mode `errors-in-console` on Lighthouse is gone.

Also cleaned up in this pass: stripped `export const dynamic = "force-dynamic"` from `src/app/login/page.tsx` and `export const runtime = "nodejs"` from `src/app/api/sign-cloudinary-params/route.ts` (both incompatible with `cacheComponents`). Moved `cacheComponents` from `experimental` to the top level of `next.config.ts` (Next 16 renamed it).

---

## Current focus

**Home page rebuilt 2026-08-07** — highlight-reel-plus-archive pattern. The old R3F hero (icosahedron + orbiting octahedron with 4 hotspots) was retired earlier; this pass replaces the placeholder shell with a full-length home page that grows itself as dashboard content lands. Seven sections in order: (1) `<Hero>` — metric-first typography (`~200 ms → ~20 ms` in mono, 8.5rem on desktop) + name + role + two CTAs, with a lightweight capability-gated Three.js drifting mesh (`hero-mesh.tsx`: single Icosahedron + orbiting Torus, only ~10 lines of scene code — no hotspots, no camera choreography) via `next/dynamic({ ssr:false })`. GSAP mount reveal via `@gsap/react` `useGSAP` with staggered `data-hero-line` fade+blur. CSS starfield (`StarBackdrop`) as the universal fallback backdrop, no JS. (2) `<SectionReceipts>` — 3 hardcoded proof cards (200→20ms case study, RLS multi-tenant starter, MessageMind pipeline) linking out to public artefacts. Double-bezel nested card architecture per high-end-visual-design skill. (3) `<SectionNow>` — one-liner for current role at ZMC. (4) `<SectionFeaturedProjects>` — DB-driven, reads `listPublishedProjects()` capped to 3, `"use cache" + cacheTag('projects')`, returns `null` when empty. (5) `<SectionTrackRecord>` — 4 stat cells with GSAP `CountUp` on viewport enter. **The `2 SaaS acquired · NDA · contract on request` line lives here** — captures the two SaaS exits Hasibul had asked to feature. (6) `<SectionFeaturedWriting>` — same pattern as projects, `listPublishedPostsCursor({limit:3}) + tag.posts()`, auto-hides on empty. (7) `<SectionContact>` — CTA card + WhatsApp/Telegram/Email buttons duplicating the floating action for scroll-bottom discoverability. Reveals use a shared `<ScrollReveal>` with `useGSAP` + `ScrollTrigger.once:true`; `prefers-reduced-motion` disables all motion. i18n written into `en.json` (full copy) + `bn.json` (full Bengali translation); `ar`/`ur`/`he` got English placeholder content with local kicker/heading retained (owner to localize later). `<script type="application/ld+json">` Person schema injected on `/` for AI-crawler + Google Rich Results. Typecheck + lint green. Dev smoke at 200 OK with all 7 sections rendered in SSR HTML.

Prior work: Phase 1 code-complete, Phase 1.5 in progress (Links removal + polish list), Phase 2 shipped (blog list + slug + category/tag pages + SEO surface), Phase 3 shipped (`/resume`), Phase 4 retired the R3F hotspot hero.

Last touched: 2026-08-02 (Hero redesign v2 — user said "not happy with the results". Rebuilt the `/` composition to feel intentional instead of prototype-ish: (1) `GeometricForms` reduced from 4 shapes to Centerpiece icosahedron (radius 1.6, slow-spin) + orbiting orange Satellite octahedron — cleaner focal hierarchy. (2) `ParticleField` added — 350-dot cream star field (positions seeded once at module scope to satisfy `react-hooks/purity`). (3) `Hotspot` redesigned: instead of tiny sphere the user has to hunt for, each hotspot now renders a drei `<Html>` DOM pill button with a mono `01/02/03/04` counter, label, and arrow — always visible, obviously clickable. Anchor sphere shrunk to 0.045 spark below the pill. Because the pill is a real `<button>` element inside `<Html pointerEvents=auto>`, clicks work through normal DOM events (no R3F raycast dependency — should fix the "hotspot won't click" issue). (4) `HOTSPOTS` repositioned to a front-facing arc `[-3, 1.6, 2.8]` / `[-1.1, 0.5, 3.6]` / `[1.1, 0.5, 3.6]` / `[3, 1.6, 2.8]` — all four pills sit inside the 1440-wide viewport with room to breathe. (5) Camera rig replaced orbit with a gentle sine bob (`sin(t*0.25)*0.35` on X, `sin(t*0.4)*0.18` on Y) at `[0, 2.8, 9]` fov 42 so labels stay readable; GSAP focus tween preserved for hotspot activation. (6) Fog + lighting tweaked (ambient 0.55, orange rim 0.9, orange fill 0.4). Verified via Playwright screenshot at 1440×900: composition reads as premium — big dark icosahedron dominates, orange satellite orbits, star field adds depth, all 4 labeled pills visible top and bottom of the arc. Typecheck + lint green.

Prior polish pass same day (Full-site walkthrough + polish pass after Phase 4 v1. Findings and fixes: (1) No shared public nav — shipped `src/components/site-header.tsx` (sticky, blur backdrop, Blog/Resume pills, active-state highlight) mounted in root layout; suppresses itself on `/dashboard*` and `/login`. (2) Home page hero + R3F canvas were showing on a cream strip when the site theme cookie was `light` — the hero must be dark per §16, so `/` now hardcodes `data-theme="dark"`, `bg:#0f131a`, `text:#f2e4d0` and pulls the main up under the sticky header (`-mt-16` + `pt-16`) so the header floats over the canvas with backdrop-blur. (3) R3F composition made more readable: front `ambientLight`+ key `directionalLight` intensities lifted, added an orange fill point-light under the origin, form base color raised from pure navy to `#3a4762`. Torus knot scaled from radius 0.7 to 0.48 so it no longer dominates the right side. (4) Blog list header rewritten with an orange kicker, larger hero title, richer excerpt copy; PostCard cards upgraded to `rounded-xl` + `ring-1 ring-black/5`, hover scale, tighter typography. (5) Blog detail (`/blog/[slug]`) got a `← ALL POSTS` back link, larger title, orange category chip. (6) Resume page: orange kicker, filename as headline, `size="lg"` Download button. (7) **Bug fixed**: enabling `experimental.cacheComponents` in Phase 2 broke every dashboard page that had `export const dynamic = "force-dynamic"` (incompatible directive). Stripped from `dashboard/layout.tsx`, `dashboard/page.tsx`, `dashboard/posts/page.tsx`, `dashboard/posts/new/page.tsx`, `dashboard/posts/[id]/edit/page.tsx`, `dashboard/categories/page.tsx`, `dashboard/tags/page.tsx`, `dashboard/media/page.tsx`, `dashboard/resume/page.tsx` — 9 files. Verified live via Playwright: `/`, `/blog`, `/blog/[slug]`, `/resume`, `/dashboard` all render clean. Owner still needs to try a hotspot click on `/` (R3F raycast requires a real mouse; my synthetic events don't reach it).)
