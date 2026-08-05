"use server";

import { updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projectLinks, projects } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { projectInput } from "@/schemas/project";
import type { ProjectLinkInput } from "@/schemas/project";

export type ActionState = { error?: string; ok?: true } | null;

// Minimal empty TipTap doc used when the author leaves the body / outcome
// textarea blank. Body is jsonb NOT NULL in the schema.
const EMPTY_DOC = { type: "doc", content: [] };

/**
 * Convert a plain-text textarea value into a TipTap-compatible JSON doc.
 * Each blank-line block becomes a paragraph; single newlines stay inside
 * one paragraph as hard breaks. Round-trippable enough for MVP editing —
 * a full TipTap editor slot will replace this later without a data change.
 */
function textToDoc(text: string): Record<string, unknown> {
  const t = text.trim();
  if (!t) return EMPTY_DOC;
  const paragraphs = t.split(/\n{2,}/);
  return {
    type: "doc",
    content: paragraphs.map((p) => ({
      type: "paragraph",
      content: p
        .split("\n")
        .flatMap((line, i) =>
          i === 0
            ? [{ type: "text", text: line }]
            : [{ type: "hardBreak" }, { type: "text", text: line }],
        ),
    })),
  };
}

// Best-effort host check for App Store / Play Store links so a mistyped
// URL surfaces before it hits the public site. Soft errors only — Zod
// still enforces valid URL shape.
function validateLinkHosts(links: ProjectLinkInput[]): string | null {
  for (const l of links) {
    try {
      const host = new URL(l.url).hostname;
      if (l.kind === "app_store" && !host.endsWith("apps.apple.com")) {
        return `App Store link "${l.label}" doesn't point to apps.apple.com.`;
      }
      if (l.kind === "play_store" && !host.endsWith("play.google.com")) {
        return `Play Store link "${l.label}" doesn't point to play.google.com.`;
      }
      if (l.kind === "github" && !host.endsWith("github.com")) {
        return `GitHub link "${l.label}" doesn't point to github.com.`;
      }
    } catch {
      return `Link "${l.label}" is not a valid URL.`;
    }
  }
  return null;
}

export async function saveProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;

  const bodyText = String(formData.get("bodyText") ?? "");
  const outcomeText = String(formData.get("outcome") ?? "").trim();

  const periodStartRaw = String(formData.get("periodStart") ?? "").trim();
  const periodEndRaw = String(formData.get("periodEnd") ?? "").trim();
  // HTML date inputs give YYYY-MM-DD; upgrade to ISO so Zod's `.datetime()`
  // is satisfied. Nullable — blank stays null.
  const toIso = (s: string) =>
    s ? new Date(`${s}T00:00:00.000Z`).toISOString() : null;

  // Links are posted as parallel arrays; each row's index must line up.
  const linkKinds = formData.getAll("linkKind").map(String);
  const linkLabels = formData.getAll("linkLabel").map(String);
  const linkUrls = formData.getAll("linkUrl").map(String);
  const links = linkKinds
    .map((kind, i) => ({
      kind,
      label: (linkLabels[i] ?? "").trim(),
      url: (linkUrls[i] ?? "").trim(),
    }))
    .filter((l) => l.kind && l.label && l.url);

  const displayOrderRaw = String(formData.get("displayOrder") ?? "0").trim();

  const parsed = projectInput.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    client: String(formData.get("client") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    role: String(formData.get("role") ?? "").trim() || null,
    periodStart: toIso(periodStartRaw),
    periodEnd: toIso(periodEndRaw),
    body: textToDoc(bodyText),
    outcome: outcomeText || null,
    category: String(formData.get("category") ?? "enterprise"),
    coverMediaId: (formData.get("coverMediaId") as string) || null,
    ogImageId: (formData.get("ogImageId") as string) || null,
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
    metaDescription:
      String(formData.get("metaDescription") ?? "").trim() || null,
    noindex: formData.get("noindex") === "on",
    featured: formData.get("featured") === "on",
    displayOrder: displayOrderRaw === "" ? 0 : Number(displayOrderRaw),
    status: (formData.get("status") as "draft" | "published") ?? "draft",
    tagIds: [], // MVP: no tag picker yet
    links,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const hostErr = validateLinkHosts(parsed.data.links);
  if (hostErr) return { error: hostErr };

  // Slug uniqueness (skip current row on edit).
  const clash = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      id
        ? and(eq(projects.slug, parsed.data.slug), ne(projects.id, id))
        : eq(projects.slug, parsed.data.slug),
    )
    .limit(1);
  if (clash.length) return { error: "Slug already in use." };

  // MVP: tagIds is parsed for schema compat but not persisted yet — projects
  // tag picker will land with the tags.kind='tech' UI in a follow-up.
  const { links: linkRows, tagIds: _unusedTagIds, ...rest } = parsed.data;
  void _unusedTagIds;

  // First-transition-to-published sets publishedAt exactly once; going back
  // to draft clears it.
  let publishedAt: Date | null | undefined = undefined;
  if (rest.status === "published") {
    if (id) {
      const [prev] = await db
        .select({ status: projects.status, publishedAt: projects.publishedAt })
        .from(projects)
        .where(eq(projects.id, id));
      publishedAt =
        prev && prev.status === "published"
          ? (prev.publishedAt ?? new Date())
          : new Date();
    } else {
      publishedAt = new Date();
    }
  } else {
    publishedAt = null;
  }

  const dbValues = {
    ...rest,
    periodStart: rest.periodStart ? new Date(rest.periodStart) : null,
    periodEnd: rest.periodEnd ? new Date(rest.periodEnd) : null,
    publishedAt,
  };

  let savedId: string;
  let prevSlug: string | null = null;
  if (id) {
    const [prev] = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, id));
    prevSlug = prev?.slug ?? null;
    await db
      .update(projects)
      .set({ ...dbValues, updatedAt: new Date() })
      .where(eq(projects.id, id));
    savedId = id;
    await db.delete(projectLinks).where(eq(projectLinks.projectId, id));
  } else {
    const [row] = await db.insert(projects).values(dbValues).returning();
    savedId = row.id;
  }

  if (linkRows.length) {
    await db.insert(projectLinks).values(
      linkRows.map((l, i) => ({
        projectId: savedId,
        kind: l.kind,
        label: l.label,
        url: l.url,
        sortOrder: i,
      })),
    );
  }

  updateTag(tag.projects());
  updateTag(tag.project(parsed.data.slug));
  // If the slug changed, bust the old detail cache too so the moved page
  // renders 404 on next visit instead of serving stale content.
  if (prevSlug && prevSlug !== parsed.data.slug) {
    updateTag(tag.project(prevSlug));
  }
  return { ok: true };
}

export async function deleteProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing id" };
  const [prev] = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(eq(projects.id, id));
  await db.delete(projects).where(eq(projects.id, id));
  updateTag(tag.projects());
  if (prev) updateTag(tag.project(prev.slug));
  return { ok: true };
}
