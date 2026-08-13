import { and, asc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { receipts } from "@/lib/db/schema";

export type ReceiptRow = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  displayOrder: number;
  status: "active" | "archived";
  updatedAt: Date;
};

export async function listReceiptsForDashboard(): Promise<ReceiptRow[]> {
  return db
    .select({
      id: receipts.id,
      kicker: receipts.kicker,
      title: receipts.title,
      body: receipts.body,
      ctaLabel: receipts.ctaLabel,
      ctaHref: receipts.ctaHref,
      displayOrder: receipts.displayOrder,
      status: receipts.status,
      updatedAt: receipts.updatedAt,
    })
    .from(receipts)
    .orderBy(asc(receipts.displayOrder), asc(receipts.createdAt));
}

export type PublicReceipt = Pick<
  ReceiptRow,
  "id" | "kicker" | "title" | "body" | "ctaLabel" | "ctaHref"
>;

/**
 * Home strip: first three active receipts and whether more exist.
 * Peek at limit+1 so the "See all" button can decide whether to render.
 */
export async function listReceiptsForHome(): Promise<{
  items: PublicReceipt[];
  hasMore: boolean;
}> {
  const rows = await db
    .select({
      id: receipts.id,
      kicker: receipts.kicker,
      title: receipts.title,
      body: receipts.body,
      ctaLabel: receipts.ctaLabel,
      ctaHref: receipts.ctaHref,
    })
    .from(receipts)
    .where(eq(receipts.status, "active"))
    .orderBy(asc(receipts.displayOrder), asc(receipts.createdAt))
    .limit(4);
  return { items: rows.slice(0, 3), hasMore: rows.length > 3 };
}

/**
 * Legacy home-section fetch. Kept for callers that still want the fixed
 * three-card slice without the hasMore probe. Prefer `listReceiptsForHome`.
 */
export async function listActiveReceipts(): Promise<PublicReceipt[]> {
  return (await listReceiptsForHome()).items;
}

/**
 * Cursor tuple over `(displayOrder ASC, id ASC)`. `createdAt` is not in the
 * cursor because `id` is already a stable tiebreaker within the same order.
 */
export type ReceiptCursor = { o: number; id: string };

export function encodeReceiptCursor(c: ReceiptCursor | null): string | null {
  if (!c) return null;
  return Buffer.from(JSON.stringify(c), "utf8").toString("base64url");
}

export function decodeReceiptCursor(s: string | null): ReceiptCursor | null {
  if (!s) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(s, "base64url").toString("utf8"),
    ) as ReceiptCursor;
    if (typeof parsed.o !== "number" || typeof parsed.id !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export type ReceiptsPage = {
  items: PublicReceipt[];
  nextCursor: string | null;
};

export async function listActiveReceiptsCursor(input: {
  cursor?: string | null;
  limit?: number;
}): Promise<ReceiptsPage> {
  const limit = Math.min(Math.max(input.limit ?? 6, 1), 24);
  const cur = decodeReceiptCursor(input.cursor ?? null);

  const conds = [eq(receipts.status, "active")];
  if (cur) {
    conds.push(
      or(
        sql`${receipts.displayOrder} > ${cur.o}`,
        and(
          sql`${receipts.displayOrder} = ${cur.o}`,
          sql`${receipts.id} > ${cur.id}`,
        ),
      )!,
    );
  }

  const rows = await db
    .select({
      id: receipts.id,
      kicker: receipts.kicker,
      title: receipts.title,
      body: receipts.body,
      ctaLabel: receipts.ctaLabel,
      ctaHref: receipts.ctaHref,
      displayOrder: receipts.displayOrder,
    })
    .from(receipts)
    .where(and(...conds))
    .orderBy(asc(receipts.displayOrder), asc(receipts.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items: PublicReceipt[] = rows
    .slice(0, limit)
    .map(({ displayOrder: _o, ...r }) => r);
  const last = rows[items.length - 1];
  const nextCursor =
    hasMore && last
      ? encodeReceiptCursor({ o: last.displayOrder, id: last.id })
      : null;
  return { items, nextCursor };
}
