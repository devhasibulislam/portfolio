import { revalidateTag } from "next/cache";
import { tag } from "@/lib/cache-tags";

export const dynamic = "force-dynamic";

/**
 * Dashboard-only cache buster. Auto-protected by proxy.ts (matches
 * /dashboard/:path*). Revalidates every public cache tag, then returns
 * the list. Use when data lands via a raw SQL/seed path that skipped the
 * usual server action's updateTag call.
 *
 * GET /dashboard/revalidate
 */
export async function GET() {
  const tags = [
    tag.projects(),
    tag.posts(),
    tag.experiences(),
    tag.skills(),
    tag.categories(),
    tag.tags(),
    tag.receipts(),
    tag.resumes(),
    tag.activeResume(),
    tag.media(),
  ];
  for (const t of tags) revalidateTag(t, "max");
  return Response.json({
    ok: true,
    revalidated: tags,
    at: new Date().toISOString(),
  });
}
