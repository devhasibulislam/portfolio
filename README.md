# Portfolio

Personal portfolio + blog + private dashboard for [devhasibulislam](https://github.com/devhasibulislam).

- **Spec**: [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — frozen source of truth
- **Progress + resume-from-any-device instructions**: [`docs/BUILD_PLAN.md`](./docs/BUILD_PLAN.md)

## Stack

Next 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Drizzle + Neon Postgres · Neon Auth (Managed Better Auth) · Cloudinary · next-intl (5 locales, RTL) · GSAP + Framer Motion + Three.js/R3F (Phase 4)

## Quick start

```bash
git clone https://github.com/devhasibulislam/portfolio.git
cd portfolio
cp .env.example .env.local   # fill in values from your password manager
npm install
npm run dev                  # http://localhost:3000
```

## Scripts

| Command               | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `npm run dev`         | Dev server (Turbopack)                                     |
| `npm run build`       | Production build                                           |
| `npm start`           | Serve production build                                     |
| `npm run typecheck`   | `tsc --noEmit`                                             |
| `npm run lint`        | ESLint                                                     |
| `npm run db:generate` | Generate Drizzle SQL migration from `src/lib/db/schema.ts` |
| `npm run db:migrate`  | Apply pending migrations                                   |
| `npm run db:studio`   | Drizzle Studio                                             |

## Repo layout

```
proxy.ts                     Next 16 auth middleware (NOT middleware.ts)
drizzle.config.ts            Drizzle Kit config
components.json              shadcn config
.vscode/mcp.json             Project-scoped MCPs (shadcn, Next.js, Cloudinary, Vercel, Playwright, Chrome DevTools)
.github/instructions/        Repo-scoped Copilot skills (Drizzle, blog schemas, RTL)
messages/                    next-intl message catalogs (en, bn, ar, ur, he)
public/brand/reference.jpg   Source photo for palette + mood
docs/BUILD_PLAN.md           Progress ledger + resume-from-any-device steps
src/
  app/                       App Router routes (/, /login, /dashboard, /api/auth/[...path])
  lib/
    auth/                    Neon Auth server + client instances
    db/                      Drizzle + pooled Neon client
    i18n/                    Cookie-based locale + next-intl request config
    theme/                   Cookie-based theme (dark-first)
    utils.ts                 shadcn cn()
  schemas/                   Shared Zod schemas (one per entity)
  components/ui/             shadcn primitives (added on demand)
```

## Routes

- `/` — landing (Phase 4: 3D scene on capable devices, GSAP/Framer on mobile)
- `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]` — Phase 2
- `/resume` — Phase 3
- `/links` — Phase 3
- `/login` — dashboard login (not linked anywhere, type manually)
- `/dashboard` — private admin, single-user (`DASHBOARD_ALLOWED_EMAIL`)

## MCP servers (project-scoped, in `.vscode/mcp.json`)

Load automatically when you open the workspace in VS Code. No global config touched.

## License

Personal project. No license granted.
