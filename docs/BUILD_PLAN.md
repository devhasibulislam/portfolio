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
- [x] Theme toggle (Light / Dark / System) in the dashboard header — mirrors onto `<html data-theme>` synchronously + persists cookie server-side

---

## Phase 1.5 — Dashboard polish (owner feedback)

Ship-blockers surfaced by first real use of the dashboard. Group by area; each item is a small change on top of the Phase 1 code. **Discussion still open — the owner will pick priority/scope before we start writing.**

### Overview (dashboard home)

- [ ] **Cards** — the whole card is already a `<Link>`; drop the arrow icon since redundant. Add a **count badge** in the top-right corner (icon stays top-left). E.g. `Posts (05)`, `Media (12)`. Format as two digits with a leading zero.

### Posts — list view

- [ ] **Status column** = a real toggle (shadcn `Switch` in a `Tooltip`) that flips draft ↔ published in place via a small server action + `updateTag('posts')`. Optimistic UI + toast on error.

### Posts — create/edit form

- [ ] **Cover image**: replace the current MediaPicker with a single reusable modal that combines _pick-from-existing_ **and** _upload-new_ (Cloudinary widget) inside the same surface. Applies to the Media page too where sensible.
- [ ] **Free cropper** — display the intrinsic resolution + let the user drag/reposition a crop rect at any target ratio. Used by both Cover picker and inline Body images. Ships as a shared component (`src/components/dashboard/image-cropper.tsx`).
- [ ] **Category select** — full-width to match the tags row.
- [ ] **Tags picker** — redesign. Current chip-plus-search UI feels utilitarian; move to something with better discovery and hover states (candidate: shadcn Command palette style with grouped suggestions, keyboard-navigable).
- [ ] **Tiptap toolbar** — sticky **within** the editor container as the body scrolls, not sticky to the viewport. Use `position: sticky; top: 0` inside the scrollable editor pane.
- [ ] **Tiptap active state** — active-mark styling should only reflect _the current selection inside the editor_. Currently when focus leaves the editor the toolbar keeps `H2`/`Link` lit. Fix by binding to `editor.state.selection` + a `focus` listener; clear active classes when the editor loses focus.
- [ ] **Tiptap Image tool** — replace the `window.prompt("Image URL")` with the same reusable pick-or-upload modal used by the cover, backed by the same free cropper. Multi-file upload, `jpg|jpeg|png|gif|webp`, each ≤1MB (client-side reject).
- [ ] **Clarification — social preview / SEO fields.** Current form has `meta_description` (Google snippet, 120–160 chars) and `excerpt` (listing card, 200–300). Social preview reuses the cover image at 1200×630 via `next/og`. Per PROJECT_CONTEXT §5 there is no separate OG title / OG description — Google, Facebook, LinkedIn, Twitter all fall back to `<title>` + `meta_description` + the OG image, so the current three fields cover it. Confirm before we build anything extra.

### Categories & Tags

- [ ] **Edit action** — the whole row is currently clickable (opens the edit dialog). Owner wants an **explicit pencil icon** next to the delete icon so it is discoverable. Row-click stays as a shortcut.
- [ ] **Delete button** — currently opens a dialog that says "Blocked". Change to **disable the button entirely** with a tooltip explaining why (e.g. "In use by 3 posts") when `postCount > 0`.

### Media

- [ ] **Delete disabled when `inUse === true`** — right now the button opens a "blocked" alert dialog. Same fix as above: disable the button + tooltip.
- [ ] **Lightbox** — click a tile to open a large-size preview modal. Shows original resolution + file size; secondary "Copy public_id" and "Copy URL" buttons.

### Resume

- [ ] **Explicit active/inactive toggle button** — the native radio is not discoverable enough. Use a shadcn `Switch` or a clear "Set active" button per row.
- [ ] **Confirm behaviour**: activating a new resume already deactivates the previously-active one (partial-unique index + two-step `UPDATE`). The first-uploaded resume already defaults to `is_active = true`. Both behaviours exist server-side but were invisible in the UI — the toggle redesign fixes that.

### Links

- [ ] **Remove entirely.** Drop the DB table (`links`), the `linkInput` Zod schema, the `/dashboard/links` page + form + query + server actions, the nav entry, the cache tag `tag.links()`, and the placeholder for the public `/links` page (Phase 3). Ship a Drizzle migration that drops the table.

### Cross-cutting

- [ ] **Full device responsive audit** — every dashboard page at 375 / 768 / 1024 / 1280+. Playwright screenshot each width and fix overflow / hidden controls.
- [ ] **Bottom nav bar on small/mid devices** — hide the sidebar on `< md`, render a horizontal icon bar at the bottom of the viewport with the same 6 destinations (Overview / Posts / Categories / Tags / Media / Resume). Sign-out and theme toggle move into a sheet drawer accessed from the header.

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

## Phase 3 — `/resume`

- [ ] `/resume` — embed active PDF, download button, nothing else. (`/links` was dropped in Phase 1.5.)

---

## Phase 4 — The `/` experience

- [ ] Capability detector (WebGL renderer + `deviceMemory` + primary-input) — runs before any Three.js imports
- [ ] `next/dynamic({ ssr: false })` for Three.js/R3F — verify Three not shipped to mobile in Network tab
- [ ] Procedural `GeometricForms` — no `.glb` pipeline
- [ ] Hotspot system + GSAP camera choreography
- [ ] `MobileFallbackExperience` — separate tree, GSAP + Framer only

_(The `LinksPortal` hotspot was dropped when Links was removed in Phase 1.5.)_

---

## Phase 5 — Polish

- [ ] Neon Management API dashboard widget (optional; §11)
- [ ] Lighthouse pass
- [ ] Cache-tag audit
- [ ] Deploy to Vercel, wire env, sanity-check every route

---

## Current focus

**Phase 1 code-complete ✅.** All 16 dashboard checkboxes ticked plus the theme toggle. HEAD on `origin/master`. Two manual tests still owed by the owner (Cloudinary upload widget for Media and Resume — Playwright can't reliably drive the widget iframe).

**Now working on Phase 1.5** — the polish list above. Discussion still open; the owner will pick order before implementation starts. Confirmed items so far:

- Links will be removed entirely (table, page, schema, cache tag, migration).
- Sidebar avatar alignment when collapsed → fixed (`SidebarMenuButton size="lg"` in the header).
- Resume auto-activate + swap-active behaviour already works server-side; toggle redesign is a UX fix, not a logic fix.
- SEO/OG surface as-designed uses `meta_description` + `excerpt` + cover image; no separate OG title/description per §5. Awaiting owner sign-off before ruling that out for good.

**Phase 2 (after 1.5 lands):**

1. Shared `useCursor<Item>(filter)` hook — one implementation, three consumers per §14.
2. `/blog` list with cursor-based infinite scroll (no offset pagination).
3. `/blog/[slug]` with `generateMetadata` + Article JSON-LD + canonical + hreflang.
4. `/blog/category/[slug]` and `/blog/tag/[slug]` — real server-rendered SEO pages, not client filters.
5. `next/og` fallback OG image when a post has no cover.
6. `sitemap.xml`, `robots.txt`, `llms.txt` — hreflang for all 5 locales.

Last touched: 2026-07-31 (Phase 1.5 opened; sidebar-collapsed alignment fix landed)
