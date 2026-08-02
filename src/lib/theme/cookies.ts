import { cookies } from "next/headers";

export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";
export const DEFAULT_THEME: Theme = "light"; // light-first (owner preference)

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}

/**
 * Server-side theme resolver.
 * - Explicit cookie wins.
 * - No cookie: returns DEFAULT_THEME. First-visit "match system" is handled
 *   client-side (prefers-color-scheme) with a no-flash inline script, because
 *   the server cannot read the client's OS preference.
 */
export async function getTheme(): Promise<Theme> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;
  return isTheme(value) ? value : DEFAULT_THEME;
}
