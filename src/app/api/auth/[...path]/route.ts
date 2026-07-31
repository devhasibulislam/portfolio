import { auth } from "@/lib/auth/server";
import { stripCookieExpiry } from "@/lib/auth/session-cookie";

// Neon Auth catch-all handler. Wrapped so session cookies die on tab close
// (PROJECT_CONTEXT §11). No other custom logic — put auth business rules in
// server actions or the proxy middleware.
const h = auth.handler();

type Ctx = { params: Promise<{ path: string[] }> };
const wrap =
  (fn: (req: Request, ctx: Ctx) => Promise<Response>) =>
  async (req: Request, ctx: Ctx) =>
    stripCookieExpiry(await fn(req, ctx));

export const GET = wrap(h.GET);
export const POST = wrap(h.POST);
