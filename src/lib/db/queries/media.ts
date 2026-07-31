import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { media, posts } from "@/lib/db/schema";

export type MediaRow = {
  id: string;
  publicId: string;
  url: string;
  originalName: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  folder: string;
  createdAt: Date;
  inUse: boolean;
};

/**
 * All media with an `inUse` flag (true if any post references it as a cover).
 * One query — no N+1 (§14).
 */
export async function listMedia(): Promise<MediaRow[]> {
  return db
    .select({
      id: media.id,
      publicId: media.publicId,
      url: media.url,
      originalName: media.originalName,
      width: media.width,
      height: media.height,
      bytes: media.bytes,
      format: media.format,
      folder: media.folder,
      createdAt: media.createdAt,
      inUse:
        sql<boolean>`EXISTS (SELECT 1 FROM ${posts} WHERE ${posts.coverMediaId} = ${media.id})`.as(
          "in_use",
        ),
    })
    .from(media)
    .orderBy(desc(media.createdAt));
}
