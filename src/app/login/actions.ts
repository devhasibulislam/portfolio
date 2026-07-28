"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

const ALLOWED_EMAIL = process.env.DASHBOARD_ALLOWED_EMAIL;

export type LoginState = { error: string } | null;

/**
 * Sign in via Neon Auth email+password.
 *
 * Session-only cookie: Neon Auth defaults to persistent cookies. We can't
 * strip the Max-Age here from a server action (Set-Cookie is written by the
 * SDK). The current Phase-0 wiring keeps the SDK default; Phase 1 will add
 * a Response header rewrite (or an SDK-level cookie option once documented)
 * to force browser-session behaviour per §11. Marked TODO in BUILD_PLAN.
 */
export async function signInAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Belt-and-braces: reject non-owner emails before hitting the auth service.
  if (ALLOWED_EMAIL && email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
    return { error: "Access denied." };
  }

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: error.message || "Invalid email or password." };
  }

  redirect("/dashboard");
}
