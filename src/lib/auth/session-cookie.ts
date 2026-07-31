/**
 * PC §11: dashboard sessions die on tab close. Neon Auth ships persistent
 * cookies by default, so we strip Max-Age/Expires from every Set-Cookie the
 * handler and middleware write.
 */
export function stripCookieExpiry(res: Response): Response {
  const cookies = res.headers.getSetCookie?.() ?? [];
  if (cookies.length === 0) return res;
  res.headers.delete("set-cookie");
  for (const c of cookies) {
    res.headers.append(
      "set-cookie",
      c.replace(/;\s*Max-Age=[^;]*/gi, "").replace(/;\s*Expires=[^;]*/gi, ""),
    );
  }
  return res;
}
