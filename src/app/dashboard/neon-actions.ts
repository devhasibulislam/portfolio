"use server";

import { updateTag } from "next/cache";
import { tag } from "@/lib/cache-tags";

/**
 * Manual "Refresh" button on the Neon analytics widget. Busts the cached
 * aggregate so the next render pulls fresh numbers from the Neon API.
 * Runs at most once per click — the button is disabled while pending.
 */
export async function refreshNeonAnalytics(): Promise<{
  ok: true;
  at: string;
}> {
  updateTag(tag.neonAnalytics());
  return { ok: true, at: new Date().toISOString() };
}
