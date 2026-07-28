import { auth } from "@/lib/auth/server";

// Neon Auth catch-all handler. All Managed Better Auth endpoints are proxied
// through this route. Do not add custom logic here — put auth business rules
// in server actions or in the proxy middleware.
export const { GET, POST } = auth.handler();
