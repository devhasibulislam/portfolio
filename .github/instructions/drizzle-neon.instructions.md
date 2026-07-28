---
applyTo: "src/lib/db/**/*.{ts,tsx},src/**/*server*.{ts,tsx},src/**/*action*.{ts,tsx},drizzle/**/*"
---

# Drizzle + Neon rules for this repo

## Connection
- Always import `db` from `@/lib/db/client`. Never call `neon()` or `drizzle()` anywhere else.
- The connection string **must** be the pooled Neon URL (host contains `-pooler`). The client emits a warning if it isn't. Do not silence that warning.

## Query shape
- Read-heavy public routes must be cacheable (SSG / ISR via `revalidateTag`). Never write to the database from a public route on a per-request basis.
- Writes only happen from server actions triggered by the dashboard.
- After any mutation, call `revalidateTag(...)` (or `revalidatePath(...)` for the specific route family). Do NOT rely on time-based revalidation.
- Cursor-based pagination only. No `OFFSET`.

## Schema conventions
- Timestamps: `createdAt` and `updatedAt`, both `timestamp("...", { withTimezone: true }).defaultNow().notNull()`.
- Slugs: `text("slug").notNull().unique()`.
- Cascade rules must match `PROJECT_CONTEXT.md` — deleting a category/tag/media that is *in use* must be **blocked** by the server action, not silently cascaded.
