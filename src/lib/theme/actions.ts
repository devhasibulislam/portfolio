"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isTheme, THEME_COOKIE, type Theme } from "./cookies";

/**
 * Persist an explicit theme (light|dark). The layout reads the cookie
 * server-side; the client toggle also mirrors the value onto <html> so the
 * current tab flips without a round-trip.
 */
export async function setThemeAction(next: Theme) {
  if (!isTheme(next)) return;
  const store = await cookies();
  store.set(THEME_COOKIE, next, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

/**
 * "System" = no cookie. The inline script in layout.tsx applies
 * prefers-color-scheme on first paint of every subsequent visit.
 */
export async function clearThemeAction() {
  const store = await cookies();
  store.delete(THEME_COOKIE);
  revalidatePath("/", "layout");
}
