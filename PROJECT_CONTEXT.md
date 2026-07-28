# Project Context — Personal Portfolio, Blog & Dashboard

This document is the single source of truth for this project. Use it as context for all further development decisions. Do not deviate from these decisions without explicit instruction.

---

## 1. Overview

A personal portfolio site that combines:

- An interactive 3D explorable landing scene (desktop/laptop/tablet-with-good-GPU only)
- A Linktree-style personal links page
- A full blog with categories and tags
- A resume page
- A private admin area (referred to only as **the dashboard**) for content management
- Full multi-language support with RTL/LTR mirroring
- Light/dark mode

Core priorities, in order: **performance, SEO/AI-crawler-friendliness, visual impressiveness, simplicity of maintenance.** Nothing should be built "fancy" for its own sake — every feature listed below is intentional and scoped. Do not add scope beyond what is written here without asking first.

---

## 2. Tech Stack (locked)

- **Framework**: Next.js 16 (App Router, Turbopack, Cache Components)
- **UI**: React 19, TypeScript (strict mode)
- **Component library**: shadcn/ui — used for all standard UI primitives (buttons, dialogs, forms, inputs, toasts, dropdowns, etc.) across both the public site and the dashboard. Do not hand-roll components that shadcn already provides.
- **Blog typography**: Tailwind CSS Typography plugin (`@tailwindcss/typography`) — used specifically to style Tiptap-rendered blog post body content (the `prose` class family). Do not hand-write prose CSS.
- **3D**: Three.js via React Three Fiber + drei helpers
- **Animation**: GSAP + Framer Motion
- **ORM**: Drizzle ORM
- **Database**: Neon Postgres (serverless, **free tier** — must be write-conscious, use pooled connections)
- **Rich text editor**: Tiptap
- **Media storage**: Cloudinary
- **Hosting**: Vercel

Do not introduce alternative libraries (e.g. Prisma, Sanity, MDX-based CMS, Contentful, other 3D engines, Redux, MUI, GraphQL) without explicit approval. This stack is final. Note: the site owner's day-job stack (see Section 16) includes tools like MUI, Redux Toolkit, Prisma/TypeORM, and GraphQL — these are **not** used in this project and must not bleed into this codebase; they may only appear as _content_ (e.g. mentioned in bio/experience text), never as dependencies.

---

## 3. Site Map

| Route                   | Purpose                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | 3D explorable scene on desktop/laptop/Surface-class devices; GSAP+Framer 2D animated experience on mobile/tablet. Contains a portal/link element that navigates to `/links`.                                              |
| `/links`                | Personal Linktree-style page. Single user only (me) — not a multi-user product.                                                                                                                                           |
| `/resume`               | Embeds the currently "active" resume PDF (viewer + download button). No PDF-to-HTML extraction.                                                                                                                           |
| `/blog`                 | Blog listing, cursor-based pagination, infinite scroll.                                                                                                                                                                   |
| `/blog/[slug]`          | Individual blog post. Dynamic metadata, OG image, JSON-LD.                                                                                                                                                                |
| `/blog/category/[slug]` | Posts filtered by category. Real server-rendered route, own metadata, crawlable.                                                                                                                                          |
| `/blog/tag/[slug]`      | Posts filtered by tag. Real server-rendered route, own metadata, crawlable.                                                                                                                                               |
| `/dashboard`            | The dashboard. Admin area. Not linked from anywhere in the public UI — owner types the path manually. Unauthenticated hits are redirected to `/login`. Everywhere else in this doc, "the dashboard" refers to this route. |
| `/login`                | Login page for the dashboard. Email/password via Neon Auth. No sign-up route, no forgot-password route. Also not linked from public UI.                                                                                   |

There is **no** short-link feature. This was considered, briefly reconsidered (with a countdown-toast redirect idea), and **explicitly dropped again, finally** — do not build `/r/[slug]`, any redirect/click-tracking system, or any countdown-toast-before-redirect UI anywhere in the project.

There is **no** analytics/unique-view tracking system. This was considered and explicitly dropped to avoid extra writes against the free-tier Neon database. Do not add page-view counters, "read" tracking, or any per-request database write tied to visitor traffic.

There are **no** comments and **no** likes on blog posts. Kept intentionally simple.

---

## 4. The 3D Landing Scene (`/`)

### Concept

Abstract minimalist geometric scene, not sci-fi, not particle-heavy, not asset-heavy. Inspired by the reference photo used for this project's branding (see Section 8): a dark navy void containing a few large clean geometric planes/forms (echoing the diagonal shadow shapes from the reference photo), lit dramatically with a warm orange glow as the primary light source, casting sharp directional shadows.

### Interaction model

- **Not a "game"** in the traditional sense (no WASD movement, no physics engine, no collision, no loading screens). This was a deliberate scope decision to protect performance and dev time, reconsidered once and reconfirmed as final — the hotspot-exploration model below is the agreed final direction. Do not reopen this decision without explicit new instruction.
- The experience should still feel **immersive and "sticky"** — ambient camera motion, satisfying hover/click feedback, smooth transitions — so visitors are drawn to explore every hotspot rather than bouncing immediately. This is achieved through animation polish (GSAP easing, hover glow, camera choreography), not through added mechanical complexity.
- Camera drifts/orbits gently through the scene by default (ambient motion, not user-controlled locomotion).
- A handful of **clickable hotspots** exist in the scene (glowing orange nodes/markers), each representing a section: About, Projects, Blog, Resume, Links/Contact.
- Clicking a hotspot triggers a **smooth GSAP-driven camera pan/transition** toward that object, then either reveals an overlay panel or performs a route transition.
- One hotspot specifically acts as the **portal to `/links`** — this should feel like the "final" or most prominent interactive element in the scene.

### Device gating — critical

- The 3D scene **only renders on desktop, laptop, and Surface-class devices**. It does not run on mobile or tablet under any circumstance — not even a lightweight version.
- Detection must go beyond simple viewport width, since some "laptops" are underpowered and some tablets are not what's intended here. Use a capability-based check: WebGL renderer capability, device memory (`navigator.deviceMemory` where available), and touch-primary input detection combined — not viewport width alone.
- On devices that fail the capability check: render a **GSAP + Framer Motion-driven animated 2D experience** instead — same sections/content, same visual identity (see Section 8), scroll-triggered animations, no 3D canvas loaded at all (must be code-split so the Three.js bundle never ships to these devices).

### Component structure (high-level only, no code)

- `SceneCanvas` — top-level R3F `<Canvas>` wrapper, only mounted after capability check passes
- `SceneEnvironment` — lighting, background void, ambient camera drift logic
- `GeometricForms` — the abstract plane/form geometry (procedural, not imported 3D models — no external asset pipeline needed, keeps bundle light)
- `Hotspot` — reusable clickable node component (glow effect, hover state, click handler triggering GSAP camera transition)
- `HotspotOverlay` — DOM overlay panel that appears after a hotspot is activated (About/Projects/Blog/Resume content preview)
- `LinksPortal` — the specific hotspot that transitions to `/links`
- `MobileFallbackExperience` — entirely separate component tree, GSAP/Framer only, rendered when capability check fails; mirrors the same sections without any 3D dependency

### Performance requirements

- Three.js/R3F bundle must be dynamically imported / code-split so it is never downloaded on devices using the fallback experience.
- No external 3D model files (.glb/.gltf) unless later decided — default to procedural primitive/geometric shapes to avoid an asset pipeline and keep load times minimal.

---

## 5. Blog System

### Content model (described, not coded)

- **Posts**: title, slug, meta description, excerpt/summary (for listing cards), body content (Tiptap-authored), cover image, category (one), tags (multiple, capped at a reasonable number like 5–8), published/draft status, timestamps.
- **Categories**: name, slug. Full CRUD in the dashboard.
- **Tags**: name, slug. Full CRUD in the dashboard.
- Categories and tags are both **explorable via real routes** (`/blog/category/[slug]`, `/blog/tag/[slug]`) — clicking a tag or category anywhere in the UI navigates to a dedicated, server-rendered, SEO-indexed page filtered accordingly. Not a client-side filter.

### Field validation (industry-standard SEO lengths — enforce via schema validation, e.g. Zod, on both client and server)

- **Title**: ideal 50–60 characters (Google truncates around 60), hard max ~70, minimum ~10.
- **Meta description**: 150–160 characters (Google truncates around 155–160).
- **Slug**: auto-generated from title, URL-safe, max ~75 characters.
- **Excerpt/summary** (listing card text, separate from meta description): ~200–300 characters.
- **Category name**: max ~30 characters (appears in URL and navigation).
- **Tag name**: max ~30 characters; cap number of tags per post at 5–8.

### Editor (Tiptap)

- Toolbar limited to standard formatting only: bold, italic, headings, lists, links, blockquote, code. No video embeds, no exotic block types, no heavy plugins.
- **Images are allowed inline within the body content only.** The meta description field is plain text only — no media, since OG/meta descriptions cannot contain media regardless.

### Pagination

- **Cursor-based pagination only** (e.g. using post `id`/`created_at` as the cursor). No offset-based, no numbered pagination (no "1 2 3 4" UI anywhere).
- Frontend implements **infinite scroll** (Intersection Observer triggering the next cursor fetch) on `/blog` and on category/tag filtered listings.

### Social previews (Open Graph / Twitter Card)

- Every blog post must generate a **dynamic, working social preview** via Next.js `generateMetadata`, pulling title/description/image per post.
- **Fallback when no cover image exists**: auto-generate an OG image dynamically using `next/og` (text/branding-based, using the post title and the site's brand colors) rather than requiring a mandatory cover image upload. This was a deliberate choice to reduce friction when publishing.

### Category/tag deletion behavior

- If a category or tag is currently attached to one or more posts, **deletion is blocked** until the post(s) are reassigned. Do not silently cascade-unlink. This avoids orphaned filter pages and broken references.

---

## 6. Media Library

This is a proper shared media system, not just per-post upload-and-forget.

- Dashboard includes an **Images/Gallery section**: a browsable grid of every image ever uploaded to Cloudinary through this system.
- Whenever an image is needed anywhere (post cover, inline body image), the user is given a choice: **upload a new image** or **select an existing one from the gallery**.
- Every image tracks **usage references** — i.e., which post(s)/field(s) currently reference it. (Implementation detail: a join table or reference count, checked/updated on post save — left to standard implementation, no specific schema mandated here.)
- The gallery UI must visually distinguish **"in use" vs. "unused"** images (e.g. a badge or filter toggle), so storage can be kept clean over time.
- **Deleting an image that is still in use must be blocked or clearly warned against** — same protective pattern as category/tag deletion — to avoid silently breaking a published post's image reference.

### Image constraints (enforced at upload, in the dashboard)

- Maximum file size: **≤ 1MB**, enforced client-side before upload (reject anything larger).
- **Mandatory crop UI** enforcing a fixed **1.91:1 aspect ratio** (the OpenGraph/Twitter Card standard, e.g. 1200×630px output) for any image used as a post cover/OG image. Every uploaded cover image must be guaranteed correct ratio by construction (via the crop step), not by post-hoc resizing/stretching.

---

## 7. Resume Page & System

### Public page (`/resume`)

- Simply **embeds the currently active PDF** — a PDF viewer plus a download button. No PDF-to-HTML text extraction, no structured/parsed resume content rendering. This was explicitly decided against due to unreliable layout extraction from design-heavy PDFs and was scoped down intentionally to "just embed the PDF, no fancy work."

### Dashboard resume management

- A dedicated **Resume section** in the dashboard.
- Every PDF uploaded is **kept in history** — never overwritten or deleted automatically.
- Each historical resume entry should show at least: upload date and original filename.
- The dashboard provides a way to **select which uploaded resume is currently "active"** (e.g. radio-select or toggle). Only one resume can be active at a time; selecting a new active resume automatically deactivates the previous one.
- The public `/resume` page always renders whichever resume is currently marked active.
- Stored via Cloudinary (raw/PDF resource type).

---

## 8. Visual Identity & Branding

### Source

Derived from a reference photo (provided separately, not embedded in this doc) — a portrait against a burnt-orange wall with sharp diagonal shadow shapes, subject in a navy blazer and black turtleneck, warm directional lighting, confident/editorial mood, not a generic "tech" aesthetic.

### Color palette

- **Primary**: deep burnt orange / amber — approx. `#D9711A` (fine-tune exact hex against the source image during implementation).
- **Secondary**: near-black navy — approx. `#1A2130`.
- **Accent/neutral**: warm cream/off-white, used for text-on-dark contrast and soft background elements.

### Design direction

- **Dark-mode-first** aesthetic: navy/near-black as the dominant base, burnt orange used deliberately as the "glow"/highlight/accent color — for hotspots, hover states, links, calls-to-action.
- Light mode exists as a full alternate theme (see Section 9) but the primary designed experience is dark.
- The 3D scene's dramatic light/shadow treatment and geometric forms should visually echo the reference photo's mood — this is an intentional callback, not a coincidence, and should be treated as a distinguishing design detail of the whole site.
- **Solid vs. gradient usage**: choose per-context, not uniformly. Favor **solid colors** for functional/legible surfaces — body text, UI chrome, form fields, buttons, dashboard tables — where clarity matters most. Favor **gradients** for atmospheric/expressive surfaces — hero backgrounds, hotspot glows, the 3D scene's lighting, hover/focus states, section dividers. Do not apply gradients to blog body text or dense UI where it would hurt readability.

---

## 9. Theme System (Light/Dark Mode)

- Global light/dark toggle available on **every page** of the site, including the dashboard.
- Theme preference is **stored in a cookie** (not localStorage), so it is readable server-side during SSR — this avoids a flash-of-wrong-theme on first paint.
- On a visitor's first visit (no cookie set yet), default to their **system preference** (`prefers-color-scheme`). After that, their explicit choice persists via the cookie.

---

## 10. Internationalization (i18n) & RTL/LTR Support

### Languages

- **English** — default language.
- **Bangla** — additional language, LTR.
- **Arabic** — additional language, **RTL**.
- **Urdu** — additional language, **RTL**.
- **Hebrew** — additional language, **RTL**.

### Mechanics

- Locale preference is **stored in a cookie** (not localStorage) — same reasoning as theme: server-side readable during SSR, so the correct language renders on the very first response instead of flashing the default and then switching. This also matters for SEO (`hreflang` correctness at the server level).
- **Full RTL/LTR layout mirroring is required across every single page** — not just the blog. This includes the 3D scene's DOM overlay UI, the dashboard, `/links`, `/resume`, and all blog pages.
- Implementation must use **logical CSS properties** (e.g. `margin-inline-start` instead of hardcoded `margin-left`) rather than manually flipping hardcoded left/right values per component, to keep RTL support systematic rather than patched on a per-component basis.
- `hreflang` tags must be correctly generated per page for all supported languages for SEO purposes.

---

## 11. The Dashboard (`/dashboard`)

**Terminology note**: throughout this project, "the dashboard" always and only refers to this specific route (`/dashboard`). There is no separate admin area.

### Authentication

- Route path is `/dashboard`. It is **not linked from anywhere in the public UI** — the owner types the path manually. Same for `/login`.
- Login is handled by **Neon Auth (Managed Better Auth)** via `@neondatabase/auth`, with a simple **email + password** form at `/login`. No sign-up route, no forgot-password route, no email verification flow are built.
- **Single user only**: `devhasibulislam@gmail.com`. Neon Auth (Managed Better Auth beta, as of 2026-07-28) does not yet support disabling public sign-up at the project level — the Console shows the banner *"Anyone on the web can sign up for your app. Support for restricted signups is coming soon."*. Because of this, **the app-level defence-in-depth check is the real security boundary**: any authenticated session whose `email !== DASHBOARD_ALLOWED_EMAIL` is signed out and bounced to `/login` by both `proxy.ts` and `src/app/dashboard/layout.tsx`. When Neon adds restricted sign-up, disable public sign-up at the project level too so the app-level check becomes belt-and-braces rather than the primary gate.
- **Session lifetime is browser-session only**: the auth cookie is written without a `Max-Age`/`Expires` attribute, so closing the tab or the browser forces re-login on next open. Persistent "remember me" behaviour is intentionally not offered.
- Unauthenticated requests to `/dashboard` (or any nested route) are redirected to `/login`. Post-login, the user lands back on `/dashboard`.
- No 2FA, no email alerting on failed login, no IP-based rate limiting, no application-level login-attempt counter (the previously-planned "3 attempts per day" rule was dropped in favour of Neon Auth's platform-level rate limiting). Build exactly this and nothing more unless separately instructed.

### Capabilities

The dashboard is where **all** content management happens:

- **Post CRUD** — create/edit/delete/publish blog posts via the Tiptap editor.
- **Category CRUD** — create/edit/delete categories (deletion blocked if in use — see Section 5).
- **Tag CRUD** — create/edit/delete tags (deletion blocked if in use — see Section 5).
- **Media library** — browse, upload, reuse, and safely delete images (see Section 6).
- **Resume management** — upload new resume PDFs, view history, select the active one (see Section 7).

### Optional enhancement — Neon API stats widget

- **Not required for initial launch**, but worth building once core CRUD is stable: a small dashboard widget pulling live project stats (compute usage, storage, active connections) directly from the **Neon Management API**, displayed inside the dashboard UI itself. This avoids needing to leave the site to check Neon's own console and gives at-a-glance visibility into free-tier usage (relevant given Section 13's write-discipline constraints). Treat as a nice-to-have panel (e.g. a shadcn `Card` with a few stat readouts), not a blocking dependency for anything else.

---

## 12. SEO & AI-Crawler Friendliness

- Per-page dynamic metadata via Next.js `generateMetadata` (title, description, canonical URL, OG tags, Twitter Card tags) on every route, especially blog posts, category pages, and tag pages.
- **JSON-LD structured data** on blog posts (Article schema at minimum).
- `sitemap.xml` generated dynamically, including all blog posts, categories, and tags.
- `robots.txt` configured appropriately.
- **`llms.txt`** file present at the root, specifically to aid AI/LLM crawlers in understanding and indexing the site's content.
- `hreflang` tags correctly implemented across all supported languages (see Section 10).
- All field-length constraints in Section 5 exist specifically to keep titles/descriptions from being truncated in search results and social shares.

---

## 13. Performance & Database Discipline

This project runs on **free-tier Neon Postgres**, which has limited compute hours and connection limits. Every architectural decision must respect this constraint.

- **No per-page-view database writes of any kind.** Analytics/unique-view tracking was explicitly considered and dropped for this reason (see Section 3).
- The only database writes should occur when the site owner actively publishes/edits content via the dashboard (posts, categories, tags, media, resume) — this is a naturally low-frequency, read-heavy/write-rare shape, which is ideal for the free tier.
- **Static generation** should be used wherever possible (blog listing, individual posts, category/tag pages, `/links`, `/resume`).
- **ISR (Incremental Static Regeneration) with on-demand revalidation** (`revalidatePath` / `revalidateTag`) should be triggered specifically when content is published/edited in the dashboard — not time-based polling revalidation.
- Use **Next.js 16's Cache Components** for cacheable routes.
- **Neon pooled connections** must be used (not direct/unpooled connection strings) to avoid exhausting connection limits across Vercel's serverless function instances.
- The only routes that must remain fully dynamic per-request are the dashboard's PIN authentication flow. Everything else should be static/cached wherever the content allows it.

---

## 14. Engineering Principle — Reusability & No Redundancy

This is a non-negotiable coding standard for this project, not a feature:

- **No duplicated logic.** If the same piece of logic (validation, formatting, a fetch pattern, a transformation) is needed in more than one place, it must live in a single shared function/hook/utility, not be copy-pasted.
- **Shared UI patterns must be componentized.** If two pages need visually or structurally similar UI (e.g. a card, a form field, a modal), build one reusable component with props, not near-duplicate components per page.
- **Shared data-fetching patterns** (e.g. cursor-paginated fetch logic used by `/blog`, category pages, and tag pages) must be abstracted into one reusable hook/function, parameterized by filter type, rather than three separate implementations.
- **Validation schemas** (Zod, per Section 5) should be defined once per entity (post, category, tag, media, resume) and reused across both client-side form validation and server-side enforcement — not redefined in multiple places.
- Before adding any new function or component, check whether an existing one can be extended/parameterized instead of creating a near-duplicate.

---

## 15. Explicitly Out of Scope (do not build these)

The following were discussed and deliberately excluded. Do not implement them unless the project owner explicitly asks again:

- Short link system (`/r/[slug]`, click tracking, redirect analytics, countdown-toast redirect UI) — considered twice, dropped both times, **final**.
- Page-view or "unique read" analytics/tracking of any kind.
- Blog comments or likes.
- Google AdSense / any ad integration.
- PDF-to-HTML resume content extraction or structured resume form data entry.
- Any authentication hardening beyond Neon Auth's built-in email/password + platform rate limiting (no 2FA, no email alerts on failed login, no IP-based rate limiting, no application-level attempt counter, no persistent/"remember me" sessions) unless requested again in the future.
- Sign-up, forgot-password, and email-verification flows in this app — not built. The Neon Auth sign-up endpoint itself remains open (beta limitation, see §11) but is not surfaced anywhere in the app UI, and the single-user email whitelist prevents any other account from reaching the dashboard.
- WASD movement, physics, or traditional "game" mechanics in the 3D scene — considered twice, dropped both times, **final**. The 3D scene is the hotspot-exploration model described in Section 4.
- 3D experience of any kind (full or simplified) on mobile/tablet devices.
- External 3D model files/asset pipeline (default to procedural geometry).
- Video embeds or exotic content blocks in the blog editor.
- Redux, MUI, Prisma, TypeORM, GraphQL as project dependencies (fine as _content_ references only — see Section 16).

---

## 16. Site Owner Background (source content for bio/About copy)

The following is derived from the site owner's actual resume and should be used as **real reference content** — not dynamically synced, just the source material to write into the dashboard's About/bio sections, the `/links` page bio, and the 3D scene's "About" hotspot panel once the CMS is populated.

**Name**: Hasibul Islam
**Title**: Senior Full-Stack Engineer / Sr. Backend Architect
**Location**: Dhaka, Bangladesh
**Links**: [devhasibulislam@gmail.com](mailto:devhasibulislam@gmail.com) · [linkedin.com/in/devhasibulislam](http://linkedin.com/in/devhasibulislam) · [github.com/devhasibulislam](http://github.com/devhasibulislam) · [devhasibulislam.vercel.app](https://devhasibulislam.vercel.app)

**Summary**: 7+ years shipping production Node.js, NestJS, and TypeScript systems across messaging, real-estate, CRM, ERP, e-commerce, and social-media SaaS — mostly remote/contract work with international teams (Israel, Italy, Algeria, Saudi Arabia, Bangladesh). Currently Sr. Backend Architect at ZMC Technologies (Dhaka), owning backend architecture across a real-estate ERP, property CRM, and PropTech trading platform. Notable technical win: cut a hot-path list API from ~200ms to ~20ms p95 via compound indexing, query rewrites, cache-aside, and DTO projection — documented publicly. Founded and ran Prokken, a dev agency that built and sold two SaaS products (acquired by US companies in 2025, details under NDA). Actively works with LLM/RAG/MCP tooling in production, not just as a novelty — relevant given this portfolio project's own use of AI-assisted tooling.

**Core technical range**: TypeScript, Node.js, NestJS, PostgreSQL (incl. Row-Level Security), Redis, Kafka/RabbitMQ/BullMQ, Docker/AWS, GitHub Actions CI/CD, OpenAI/Anthropic/RAG pipelines/pgvector, React/Next.js.

**Education**: MSc Computer Science, Jahangirnagar University (2025).

**Languages spoken**: Bengali (native), English (full professional), Hindi (professional working), Hebrew (elementary), Arabic (elementary) — relevant context given this project's own multi-language requirement (Section 10).

**Tone implication for this portfolio**: this is a senior, production-proven engineer's site, not a junior/aspiring-developer portfolio. Design, copywriting, and About content should read as confident, technical, and understated — competence-forward rather than resume-buzzword-forward.

Full resume detail (companies, project-by-project breakdowns, stack per engagement) exists in the site owner's original resume file and should be sourced from there directly when populating the dashboard, rather than duplicated in full here.

---

## 17. Open Items / Notes for Ongoing Work

- Reference photo `devhasibulislam.jpg` is present at the repo root and has been sampled. Working palette (overrides the approximations in §8): orange highlight `#E86B1C`, orange shadow `#B84A0F`, navy secondary `#252E3F`, near-black base `#0F131A`, cream text `#F2E4D0`. Values may still be nudged during implementation, but these are the working values.
- The site owner's full resume (`HASIBUL_ISLAM_RESUME.md`) is present at the repo root as source material for populating real content into the dashboard once built — see Section 16 for a condensed reference.
- Detailed build phase status, per-phase checklists, and "resume from another device" instructions live in `docs/BUILD_PLAN.md`. That file, not this one, is where day-to-day progress is tracked.
