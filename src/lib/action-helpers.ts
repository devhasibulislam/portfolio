/**
 * Shared building blocks for dashboard server actions. Every mutation
 * action returns the same `ActionState` shape so `useActionState()` on the
 * client can react uniformly. The `parseTiptapDoc` and `toIso` helpers
 * kept the same behaviour previously duplicated across projects + experience.
 */

export type ActionState = { error?: string; ok?: true } | null;

// Empty TipTap document used when the author leaves a body/highlights
// textarea blank. jsonb columns are NOT NULL so we always have to store
// _something_ shaped like a doc.
const EMPTY_DOC = { type: "doc", content: [] };

/**
 * Parse a TipTap doc JSON blob posted from a form. Falls back to an empty
 * doc when the string is blank or malformed so the DB constraint is happy.
 */
export function parseTiptapDoc(raw: string): Record<string, unknown> {
  if (!raw.trim()) return EMPTY_DOC;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fall through
  }
  return EMPTY_DOC;
}

/**
 * HTML `<input type="date">` posts `YYYY-MM-DD`. Zod columns expect ISO
 * strings, so upgrade to full ISO or null when the value is blank.
 */
export function toIso(s: string): string | null {
  return s ? new Date(`${s}T00:00:00.000Z`).toISOString() : null;
}

/** First zod issue message, or a generic fallback. Used by every save action. */
export function zodErr(
  parsed: { success: false; error: { issues: { message: string }[] } },
): string {
  return parsed.error.issues[0]?.message ?? "Invalid input";
}
