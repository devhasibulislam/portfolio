"use server";

import { updateTag } from "next/cache";
import { tag } from "@/lib/cache-tags";

/**
 * Manual "Refresh" button on the Vercel analytics widget. Busts the
 * cached aggregate so the next render pulls fresh numbers from the Vercel
 * REST API.
 */
export async function refreshVercelAnalytics(): Promise<{
  ok: true;
  at: string;
}> {
  updateTag(tag.vercelAnalytics());
  return { ok: true, at: new Date().toISOString() };
}
