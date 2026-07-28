---
applyTo: "src/schemas/**/*.{ts,tsx}"
---

# Blog schema field-length rules

These lengths are SEO-critical. Enforce them on both client and server via a single Zod schema per entity (see PROJECT_CONTEXT §14).

## Post

- `title`: min 10, max 70. Ideal 50–60.
- `metaDescription`: min 120, max 160.
- `slug`: URL-safe (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), max 75.
- `excerpt`: min 200, max 300.
- `tags`: min 0, max 8.
- `body`: Tiptap JSON.

## Category / Tag

- `name`: max 30.
- `slug`: URL-safe, max 30.

## Media

- `originalName`: max 255.
- `width` / `height`: for cover images used as OG images, ratio must be 1.91:1 (1200×630). Enforce in the upload action, not in the DB schema.
- File size at upload: ≤ 1MB, rejected client-side before upload.

## Rule

Never redefine these constraints inline in a route handler or form component. Import the shared Zod schema from `@/schemas/...` on both sides.
