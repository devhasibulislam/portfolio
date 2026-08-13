import { count, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  experiences,
  media,
  posts,
  projects,
  skills,
} from "@/lib/db/schema";

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
 * Distinct-media-id lookups across every FK column that points at
 * `media.id`. Six small indexed scans; cheaper than a UNION with driver
 * placeholder gymnastics.
 */
async function loadUsedMediaIds(): Promise<Set<string>> {
  const [
    postCovers,
    projectCovers,
    projectOgs,
    experienceLogos,
    experienceOgs,
    skillIcons,
  ] = await Promise.all([
    db
      .selectDistinct({ id: posts.coverMediaId })
      .from(posts)
      .where(isNotNull(posts.coverMediaId)),
    db
      .selectDistinct({ id: projects.coverMediaId })
      .from(projects)
      .where(isNotNull(projects.coverMediaId)),
    db
      .selectDistinct({ id: projects.ogImageId })
      .from(projects)
      .where(isNotNull(projects.ogImageId)),
    db
      .selectDistinct({ id: experiences.companyLogoId })
      .from(experiences)
      .where(isNotNull(experiences.companyLogoId)),
    db
      .selectDistinct({ id: experiences.ogImageId })
      .from(experiences)
      .where(isNotNull(experiences.ogImageId)),
    db
      .selectDistinct({ id: skills.iconMediaId })
      .from(skills)
      .where(isNotNull(skills.iconMediaId)),
  ]);
  const used = new Set<string>();
  for (const r of [
    ...postCovers,
    ...projectCovers,
    ...projectOgs,
    ...experienceLogos,
    ...experienceOgs,
    ...skillIcons,
  ]) {
    if (r.id) used.add(r.id);
  }
  return used;
}

/**
 * Counts every consumer of a single media id across all FK columns.
 * Used by `deleteMedia` to block deletion while anything still references it.
 */
export async function countMediaConsumers(mediaId: string): Promise<number> {
  const [p, pc, po, el, eo, si] = await Promise.all([
    db.select({ n: count() }).from(posts).where(eq(posts.coverMediaId, mediaId)),
    db.select({ n: count() }).from(projects).where(eq(projects.coverMediaId, mediaId)),
    db.select({ n: count() }).from(projects).where(eq(projects.ogImageId, mediaId)),
    db.select({ n: count() }).from(experiences).where(eq(experiences.companyLogoId, mediaId)),
    db.select({ n: count() }).from(experiences).where(eq(experiences.ogImageId, mediaId)),
    db.select({ n: count() }).from(skills).where(eq(skills.iconMediaId, mediaId)),
  ]);
  return (
    (p[0]?.n ?? 0) +
    (pc[0]?.n ?? 0) +
    (po[0]?.n ?? 0) +
    (el[0]?.n ?? 0) +
    (eo[0]?.n ?? 0) +
    (si[0]?.n ?? 0)
  );
}

export async function listMedia(): Promise<MediaRow[]> {
  const [rows, used] = await Promise.all([
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
    loadUsedMediaIds(),
  ]);
  return rows.map((r) => ({ ...r, inUse: used.has(r.id) }));
}


