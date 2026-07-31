/**
 * Kebab-case slug from any string. Handles accents, punctuation, whitespace.
 * Enforce max in the calling Zod schema — this helper doesn't truncate so
 * the length check surfaces before we ever hit the DB.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
