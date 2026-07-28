/**
 * i18n configuration. Cookie-based locale selection (no [locale] URL segment).
 * See PROJECT_CONTEXT.md §10 for the "why" — server-readable during SSR,
 * no flash-of-wrong-language on first paint, and hreflang correctness.
 */

export const LOCALES = ["en", "bn", "ar", "ur", "he"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "locale";

/** ltr for English + Bangla; rtl for Arabic, Urdu, Hebrew. */
export const DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  bn: "ltr",
  ar: "rtl",
  ur: "rtl",
  he: "rtl",
};

/** Display label per locale (used later in the language switcher). */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
  ar: "العربية",
  ur: "اردو",
  he: "עברית",
};

/** BCP 47 tags for hreflang. */
export const HREFLANG: Record<Locale, string> = {
  en: "en",
  bn: "bn",
  ar: "ar",
  ur: "ur",
  he: "he",
};

export function isLocale(value: string | undefined): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
