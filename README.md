# Portfolio

Personal portfolio + blog + private dashboard for [devhasibulislam](https://github.com/devhasibulislam). Live at `https://devhasibulislam.vercel.app`.

Open-source under the MIT License — fork it, brand it, ship your own version. See [Fork this portfolio](#fork-this-portfolio) below for the 5-minute rebrand path.

## Stack

Next 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Drizzle + Neon Postgres (pooled) · Neon Auth (Managed Better Auth) · Cloudinary · next-intl (5 locales, RTL) · TipTap · GSAP + Framer Motion + Three.js/R3F (Phase 4).

## Public routes

| Route                                       | What                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/`                                         | Landing page. Phase 4 lands a 3D hero on capable devices with a Framer Motion fallback on mobile. |
| `/blog`, `/blog/[slug]`                     | Long-form posts with TipTap-rendered bodies and cursor pagination.                                |
| `/blog/category/[slug]`, `/blog/tag/[slug]` | Post lists scoped to a category or tag.                                                           |
| `/projects`, `/projects/[slug]`             | Case studies, product work, open-source references.                                               |
| `/experience`, `/experience/[slug]`         | Roles grouped by company with promotions stacked under one card.                                  |
| `/skills`                                   | Grouped stack list, matching the resume sections.                                                 |
| `/resume`                                   | Full PDF preview (rendered via pdf.js) + download.                                                |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`  | SEO surface.                                                                                      |

Every public route is served through `"use cache"` with tag-based invalidation from the dashboard; short pages render a matching skeleton via `loading.tsx`.

## Private dashboard

Not linked from any public UI. The owner types `/login` manually and signs in with a whitelisted email.

| Route                                                                    | What                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `/dashboard`                                                             | Overview counts + Neon analytics widget.                           |
| `/dashboard/posts`, `/dashboard/posts/new`, `/dashboard/posts/[id]/edit` | Blog posts (title, slug, cover, TipTap body, tags, category, SEO). |
| `/dashboard/projects`                                                    | Projects CRUD with links, cover image, category, and rich body.    |
| `/dashboard/experience`                                                  | Roles CRUD (company slug groups promotions).                       |
| `/dashboard/skills`                                                      | Skills CRUD grouped by section (Backend, Databases, Cloud, etc.).  |
| `/dashboard/categories`, `/dashboard/tags`                               | Post-taxonomy CRUD (delete blocked while posts still use them).    |
| `/dashboard/media`                                                       | Cloudinary library with in-use badges.                             |
| `/dashboard/resume`                                                      | Upload PDFs; activate the one served at `/resume`.                 |

## Quick start

```bash
git clone https://github.com/devhasibulislam/portfolio.git
cd portfolio
cp .env.example .env.local   # fill in DATABASE_URL, Cloudinary, Neon Auth, Neon API keys
npm install
npm run db:migrate           # apply drizzle migrations against .env.local's DATABASE_URL
npm run seed:user            # create the whitelisted dashboard user
npm run dev                  # http://localhost:3000
```

## Scripts

| Command               | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `npm run dev`         | Dev server (Turbopack).                                            |
| `npm run build`       | Production build.                                                  |
| `npm start`           | Serve the production build.                                        |
| `npm run typecheck`   | `tsc --noEmit`. Runs on pre-push.                                  |
| `npm run lint`        | ESLint across `src/`.                                              |
| `npm run db:generate` | Drizzle Kit: generate a SQL migration from `src/lib/db/schema.ts`. |
| `npm run db:migrate`  | Drizzle Kit: apply pending migrations.                             |
| `npm run db:studio`   | Drizzle Studio (browser UI).                                       |
| `npm run seed:user`   | Idempotently create the sole dashboard user in Neon Auth.          |

## Repo layout

```
proxy.ts                     Next 16 auth middleware (NOT middleware.ts)
drizzle.config.ts            Drizzle Kit config
components.json              shadcn config
.vscode/mcp.json             Project-scoped MCPs (shadcn, Next.js, Cloudinary, Vercel, Playwright, Chrome DevTools)
.github/instructions/        Repo-scoped Copilot skills (Drizzle, blog schemas, RTL)
messages/                    next-intl catalogs (en, bn, ar, ur, he)
public/social/               Social icons served by the footer
docs/BUILD_PLAN.md           Progress ledger + resume-from-any-device steps
src/
  app/                       App Router routes (public + /dashboard + /login + /api/auth/[...path])
  components/
    dashboard/               Manager UIs, shared PageHeader / ConfirmDeleteDialog / field helpers
    home/                    Phase 4 hero (R3F + Framer Motion fallback)
    public-footer.tsx        Flat footer with socials + language switcher
    public-floating-actions.tsx  Contact + theme picker (bottom-end column)
    site-header.tsx          Sticky top nav
    ui/                      shadcn primitives
  hooks/                     use-cursor, use-mobile
  lib/
    auth/                    Neon Auth server + client instances
    db/                      Drizzle + pooled Neon client (`db` singleton)
    i18n/                    Cookie-based locale + next-intl request config
    theme/                   Cookie-based theme (dark-first)
    cache-tags.ts            Tag registry for `revalidateTag()` fan-out
    dates.ts                 Date-to-`<input type=date>` helper
    tiptap-render.ts         Server-side TipTap JSON → HTML renderer
  schemas/                   Shared Zod schemas (one per entity)
```

## Docs

- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — frozen source of truth. Section numbers cited in code comments.
- [`docs/BUILD_PLAN.md`](./docs/BUILD_PLAN.md) — progress ledger + resume-from-any-device steps.
- [`AGENTS.md`](./AGENTS.md) — AI-agent instructions (Copilot, Cursor, Codex).

## Fork this portfolio

Rebrand everything a visitor sees without touching any component code:

1. **Fork + clone**

   ```bash
   git clone https://github.com/YOUR-USERNAME/portfolio.git my-portfolio
   cd my-portfolio
   npm install
   ```

2. **Fill in secrets** — copy the schema, add your own accounts:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local`. **Never commit it** — a pre-commit hook blocks common secret patterns (`.husky/pre-commit` → `scripts/scan-secrets.sh`) but do not rely on it alone.

   Provision these once (all free tiers work):
   - [Neon](https://console.neon.tech) → project + pooled `DATABASE_URL` + Auth (Managed Better Auth) + API key
   - [Cloudinary](https://console.cloudinary.com) → cloud name, key, secret
   - [Vercel](https://vercel.com) → project + token (for deploy) + team/project IDs (for the analytics widget)
   - [Google PageSpeed Insights](https://console.cloud.google.com/apis/credentials) → API key (optional, dashboard widget)

3. **Swap the owner-specific bits** — everything in one file:

   ```
   src/config/site.ts          — name, tagline, email, phone, socials, brand asset paths, production host
   public/brand/avatar.jpg     — your photo (keep the filename)
   public/brand/favicon.jpg    — your favicon (keep the filename)
   public/social/*.webp        — swap any icon if you want a different set
   messages/en.json + friends  — every translated string (name lives in `brand.name`, tagline in `meta.siteDescription`)
   ```

4. **Own the content** — the home page hero copy + featured GitHub repos live in `src/components/home/config.ts`. Blog posts, projects, experience, skills, resume PDFs are all created inside `/dashboard` after you sign in — the DB starts empty for you.

5. **Boot the DB + first user**:

   ```bash
   npm run db:migrate
   # In .env.local, set DASHBOARD_ALLOWED_EMAIL + SEED_USER_NAME + SEED_USER_PASSWORD, then:
   npm run seed:user
   npm run dev
   ```

   Sign in at `http://localhost:3000/login`.

6. **Deploy** — push to Vercel. Add the same `.env.local` variables in the Vercel dashboard (Settings → Environment Variables). The `VERCEL_TEAM_ID` and `VERCEL_PROJECT_ID` power the dashboard's live-stats widget.

### Security posture

- `.env*` (except `.env.example`) is gitignored — real secrets never enter git.
- `.husky/pre-commit` runs `scripts/scan-secrets.sh` before every commit and refuses any staged file that contains a Postgres URL with an inline password, a Neon / Vercel / Google / OpenAI / AWS key, or a PEM private key. Extend the patterns for your own secret shapes.
- No history rewriting has ever been needed — git log is clean of secrets from day one.
- The dashboard is single-user by design: `DASHBOARD_ALLOWED_EMAIL` in `.env.local` is a hard whitelist enforced in `proxy.ts` + `src/app/dashboard/layout.tsx` + `src/app/login/actions.ts`. Change it to your own email; no other user can reach `/dashboard` even if Neon Auth would accept them.

## License

MIT. See [LICENSE](./LICENSE). You own everything you build on top of it — just don't ship a page that still says "Hasibul Islam" in the footer.
