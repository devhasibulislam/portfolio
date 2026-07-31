import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { links } from "@/lib/db/schema";

export type LinkRow = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
};

export async function listLinks(): Promise<LinkRow[]> {
  return db
    .select({
      id: links.id,
      label: links.label,
      url: links.url,
      sortOrder: links.sortOrder,
    })
    .from(links)
    .orderBy(asc(links.sortOrder), asc(links.createdAt));
}
