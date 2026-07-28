/**
 * One-shot seed of the sole dashboard user.
 *
 * Neon Auth (Managed Better Auth) beta does not allow admins to set a password
 * from the Console UI (only "Delete user"). Also, sign-up cannot yet be
 * disabled at the project level. So we:
 *   1. Delete the empty-password user in the Neon Console UI (once).
 *   2. Run this script to sign up with a real password via Better Auth's HTTP
 *      endpoint.
 *   3. The single-user email whitelist in proxy.ts + dashboard/layout.tsx keeps
 *      the dashboard safe even though the Neon Auth sign-up endpoint is open.
 *
 * Idempotent: if the user already exists, prints the API error and exits 0
 * so re-runs are safe. Reads NEON_AUTH_BASE_URL, DASHBOARD_ALLOWED_EMAIL,
 * SEED_USER_NAME, SEED_USER_PASSWORD from .env.local.
 *
 * Run:  npm run seed:user
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const BASE = process.env.NEON_AUTH_BASE_URL;
const EMAIL = process.env.DASHBOARD_ALLOWED_EMAIL;
const NAME = process.env.SEED_USER_NAME || "Owner";
const PASSWORD = process.env.SEED_USER_PASSWORD;

function bail(msg: string): never {
  console.error(`\n\x1b[31m[seed:user] ${msg}\x1b[0m\n`);
  process.exit(1);
}

if (!BASE) bail("NEON_AUTH_BASE_URL is empty in .env.local.");
if (!EMAIL) bail("DASHBOARD_ALLOWED_EMAIL is empty in .env.local.");
if (!PASSWORD) bail("SEED_USER_PASSWORD is empty in .env.local.");

const url = `${BASE!.replace(/\/$/, "")}/sign-up/email`;
const origin = new URL(BASE!).origin; // trusted by Better Auth (same-origin)

async function main() {
  console.log(`[seed:user] POST ${url}`);
  console.log(`[seed:user] email=${EMAIL}  name=${NAME}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify({ email: EMAIL, name: NAME, password: PASSWORD }),
  });

  const text = await res.text();

  if (res.ok) {
    console.log(`\n\x1b[32m[seed:user] ✓ Created (${res.status})\x1b[0m`);
    console.log(`[seed:user] You can now sign in at /login with:`);
    console.log(`[seed:user]   email    ${EMAIL}`);
    console.log(`[seed:user]   password ${"*".repeat(PASSWORD!.length)}`);
    process.exit(0);
  }

  // Better Auth returns 400/422 with a JSON body on "already exists"
  console.log(`\n\x1b[33m[seed:user] Non-2xx: ${res.status}\x1b[0m`);
  console.log(text);

  if (/EMAIL_AND_PASSWORD_SIGN_UP_IS_NOT_ENABLED/.test(text)) {
    console.log(
      `\n\x1b[33m[seed:user] Fix: Neon Console → project → branch → Auth → ` +
        `Configuration → enable "Email & Password" sign-up, save, then re-run ` +
        `this script.\x1b[0m`,
    );
    process.exit(1);
  }

  if (/exist/i.test(text) || res.status === 409 || res.status === 422) {
    console.log(
      `\n\x1b[33m[seed:user] User probably already exists — safe to ignore. ` +
        `If sign-in fails, delete the user in the Neon Console and re-run.\x1b[0m`,
    );
    process.exit(0);
  }

  process.exit(1);
}

main().catch((err) => {
  console.error("\x1b[31m[seed:user] Unhandled error:\x1b[0m", err);
  process.exit(1);
});
