/**
 * `<input type="date">` expects YYYY-MM-DD. Zod columns hand us Date or ISO
 * strings and we sometimes get null on optional fields, so this one helper
 * normalises the three shapes into what the input wants (empty for null).
 */
export function toDateInputValue(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** e.g. "Aug 2026" (short) or "August 2026" (long). Used by period ranges. */
export function formatMonthYear(
  d: Date | string,
  opts: { long?: boolean } = {},
): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    month: opts.long ? "long" : "short",
    year: "numeric",
  });
}
