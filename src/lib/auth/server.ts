import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * Neon Auth (Managed Better Auth) server instance.
 *
 * - Provides `.handler()` for the API catch-all route.
 * - Provides `.middleware()` for the Next 16 proxy.ts.
 * - Provides `.getSession()`, `.signIn.email()`, `.signOut()` etc.
 *
 * NEON_AUTH_BASE_URL is copied from Neon Console → Project → Branch → Auth →
 * Configuration → Auth URL. The cookie secret must be 32+ characters.
 *
 * Session-cookie behavior: Neon Auth persists the session cookie by default.
 * PROJECT_CONTEXT §11 requires *browser-session* cookies (die on tab close),
 * enforced via a Response header rewrite — see docs/BUILD_PLAN.md Phase 1 TODOs.
 *
 * NOTE: We intentionally *do not* throw at module load if env vars are missing,
 * because `next build` traces imports and would fail before you've had a chance
 * to enable Auth in the Neon Console. Any actual auth call (signIn, getSession,
 * handler, middleware) will surface a clear error at request time via Neon's
 * SDK if the credentials are still placeholders.
 */
const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) {
  console.warn(
    "[auth] NEON_AUTH_BASE_URL is not set. Enable Auth in the Neon Console " +
      "(Project → Branch → Auth → Enable), copy the Auth URL, and paste it " +
      "into .env.local. Auth calls will fail until this is done."
  );
}
if (!cookieSecret) {
  console.warn(
    "[auth] NEON_AUTH_COOKIE_SECRET is not set. Generate with " +
      "`openssl rand -base64 48` and add to .env.local."
  );
}

export const auth = createNeonAuth({
  baseUrl: baseUrl || "https://neon-auth-not-configured.invalid",
  cookies: {
    secret: cookieSecret || "placeholder-not-configured-set-real-secret-please",
  },
});
