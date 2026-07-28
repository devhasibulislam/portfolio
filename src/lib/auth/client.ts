"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Client-side auth handle. Use in client components for signOut buttons,
 * live session state, etc. Server components + server actions use
 * `auth` from `./server`.
 */
export const authClient = createAuthClient();
