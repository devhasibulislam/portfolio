# Portfolio

Personal portfolio + blog + private dashboard for [devhasibulislam](https://github.com/devhasibulislam). Live at `https://devhasibulislam.vercel.app`.

The repository is currently private. It will be published as open source once the Phase 4 hero scene is finalised.

## Stack

Next 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Drizzle + Neon Postgres (pooled) · Neon Auth (Managed Better Auth) · Cloudinary · next-intl (5 locales, RTL) · TipTap · GSAP + Framer Motion + Three.js/R3F (Phase 4).

## Public routes

| Route | What |
| --- | --- |
| `/` | Landing page. Phase 4 lands a 3D hero on capable devices with a Framer Motion fallback on mobile. |
| `/blog`, `/blog/[slug]` | Long-form posts with TipTap-rendered bodies and cursor pagination. |
| `/blog/category/[slug]`, `/blog/tag/[slug]` | Post lists scoped to a category or tag. |
| `/projects`, `/projects/[slug]` | Case studies, product work, open-source references. |
| `/experience`, `/experience/[slug]` | Roles grouped by company with promotions stacked under one card. |
| `/skills` | Grouped stack list, matching the resume sections. |
| `/resume` | Full PDF preview (rendered via pdf.js) + download. |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | SEO surface. |

Every public route is served through `"use cache"` with tag-based invalidation from the dashboard; short pages render a matching skeleton via `loading.tsx`.

## Private dashboard

Not linked from any public UI. The owner types `/login` manually and signs in with a whitelisted email.

| Route | What |
| --- | --- |
| `/dashboard` | Overview counts + Neon analytics widget. |
| `/dashboard/posts`, `/dashboard/posts/new`, `/dashboard/posts/[id]/edit` | Blog posts (title, slug, cover, TipTap body, tags, category, SEO). |
| `/dashboard/projects` | Projects CRUD with links, cover image, category, and rich body. |
| `/dashboard/experience` | Roles CRUD (company slug groups promotions). |
| `/dashboard/skills` | Skills CRUD grouped by section (Backend, Databases, Cloud, etc.). |
| `/dashboard/categories`, `/dashboard/tags` | Post-taxonomy CRUD (delete blocked while posts still use them). |
| `/dashboard/media` | Cloudinary library with in-use badges. |
| `/dashboard/resume` | Upload PDFs; activate the one served at `/resume`. |

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

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack). |
| `npm run build` | Production build. |
| `npm start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit`. Runs on pre-push. |
| `npm run lint` | ESLint across `src/`. |
| `npm run db:generate` | Drizzle Kit: generate a SQL migration from `src/lib/db/schema.ts`. |
| `npm run db:migrate` | Drizzle Kit: apply pending migrations. |
| `npm run db:studio` | Drizzle Studio (browser UI). |
| `npm run seed:user` | Idempotently create the sole dashboard user in Neon Auth. |

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

## License

Personal project. Repository will be relicensed as open source once Phase 4 ships; until then, all rights reserved.
