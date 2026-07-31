import { desc, isNotNull } from "drizzle-orm";
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
 * All media rows with an `inUse` flag. Two round-trips instead of a
 * correlated subquery — drizzle's `sql` interpolation doesn't table-qualify
 * columns inside subqueries, and the second query is a distinct scan of
 * posts.cover_media_id (small, indexed).
 */
export async function listMedia(): Promise<MediaRow[]> {
  const [rows, usedRows] = await Promise.all([
    db
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
      })
      .from(media)
      .orderBy(desc(media.createdAt)),
    db
      .selectDistinct({ id: posts.coverMediaId })
      .from(posts)
      .where(isNotNull(posts.coverMediaId)),
  ]);
  const used = new Set(usedRows.map((r) => r.id).filter(Boolean) as string[]);
  return rows.map((r) => ({ ...r, inUse: used.has(r.id) }));
}
