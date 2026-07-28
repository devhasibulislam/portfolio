import { auth } from "@/lib/auth/server";

/**
 * Next 16 middleware (proxy.ts, not middleware.ts).
 *
 * Delegates to Neon Auth's built-in middleware for the auth check + cookie
 * refresh. Unauthenticated hits redirect to /login. The additional
 * "single-user email whitelist" defence-in-depth check lives inside
 * `src/app/dashboard/layout.tsx` where we can call auth.signOut() cleanly.
 */
export default auth.middleware({
  loginUrl: "/login",
});

export const config = {
  // Protect the dashboard and any nested routes. Everything else is public.
  matcher: ["/dashboard/:path*"],
};

