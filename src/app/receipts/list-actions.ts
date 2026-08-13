"use server";

import {
  listActiveReceiptsCursor,
  type ReceiptsPage,
} from "@/lib/db/queries/receipts";
import { PAGE_NEXT } from "@/lib/pagination";

export async function loadMoreActiveReceipts(
  cursor: string,
): Promise<ReceiptsPage> {
  return listActiveReceiptsCursor({ cursor, limit: PAGE_NEXT });
}
