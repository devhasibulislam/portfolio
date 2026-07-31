import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { stripCookieExpiry } from "@/lib/auth/session-cookie";

/**
 * Next 16 middleware (proxy.ts, not middleware.ts).
 *
 * Delegates to Neon Auth's built-in middleware for the auth check + cookie
 * refresh. Unauthenticated hits redirect to /login. The additional
 * "single-user email whitelist" defence-in-depth check lives inside
 * `src/app/dashboard/layout.tsx` where we can call auth.signOut() cleanly.
 *
 * Wrapped with stripCookieExpiry so session cookies die on tab close (§11).
 */
const mw = auth.middleware({ loginUrl: "/login" });

export default async function proxy(req: NextRequest) {
  return stripCookieExpiry(await mw(req));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
