import { asc, eq } from "drizzle-orm";
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
 * Public home-section fetch — active only, capped at 3 so the grid never
 * ships a fourth card.
 */
export async function listActiveReceipts(): Promise<PublicReceipt[]> {
  return db
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
    .limit(3);
}
