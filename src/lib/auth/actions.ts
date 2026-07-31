"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function signOutAction() {
  try {
    await auth.signOut();
  } catch {
    /* ignore — redirect anyway */
  }
  redirect("/login");
}
