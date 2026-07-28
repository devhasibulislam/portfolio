"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isTheme, THEME_COOKIE, type Theme } from "./cookies";

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
