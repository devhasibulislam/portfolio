"use server";

import { updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { receipts } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { receiptInput } from "@/schemas/receipt";
import { zodErr, type ActionState } from "@/lib/action-helpers";

export async function saveReceipt(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;

  const displayOrderRaw = String(formData.get("displayOrder") ?? "0").trim();
  const displayOrder = displayOrderRaw === "" ? 0 : Number(displayOrderRaw);

  const parsed = receiptInput.safeParse({
    kicker: String(formData.get("kicker") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    ctaLabel: String(formData.get("ctaLabel") ?? "").trim(),
    ctaHref: String(formData.get("ctaHref") ?? "").trim(),
    displayOrder,
    status: (formData.get("status") as "active" | "archived") ?? "active",
  });
  if (!parsed.success) return { error: zodErr(parsed) };

  if (id) {
    await db
      .update(receipts)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(receipts.id, id));
  } else {
    await db.insert(receipts).values(parsed.data);
  }

  updateTag(tag.receipts());
  return { ok: true };
}

export async function deleteReceipt(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };
  await db.delete(receipts).where(eq(receipts.id, id));
  updateTag(tag.receipts());
  return { ok: true };
}
