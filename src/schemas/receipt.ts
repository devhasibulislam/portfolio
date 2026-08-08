import { z } from "zod";

export const receiptStatusEnum = z.enum(["active", "archived"]);

export const receiptInput = z.object({
  kicker: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(400),
  ctaLabel: z.string().min(1).max(40),
  ctaHref: z.string().url().max(2048),
  displayOrder: z.number().int().min(0).max(9999),
  status: receiptStatusEnum,
});

export type ReceiptInput = z.infer<typeof receiptInput>;
