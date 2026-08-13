"use server";

import { updateTag } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db/client";
import { projectLinks, projects } from "@/lib/db/schema";
import { tag } from "@/lib/cache-tags";
import { projectInput } from "@/schemas/project";
import { wouldExceedFeaturedLimit } from "@/lib/db/feature-limit";
import type { ProjectLinkInput } from "@/schemas/project";
import {
  parseTiptapDoc,
  toIso,
  zodErr,
  type ActionState,
} from "@/lib/action-helpers";

// Best-effort host check for App Store / Play Store links so a mistyped
// URL surfaces before it hits the public site. Soft errors only — Zod
// still enforces valid URL shape.
async function validateLinkHosts(
  links: ProjectLinkInput[],
): Promise<string | null> {
  const t = await getTranslations("actions.projects");
  for (const l of links) {
    try {
      const host = new URL(l.url).hostname;
      if (l.kind === "app_store" && !host.endsWith("apps.apple.com")) {
        return t("linkAppStoreWrong", { label: l.label });
      }
      if (l.kind === "play_store" && !host.endsWith("play.google.com")) {
        return t("linkPlayStoreWrong", { label: l.label });
      }
      if (l.kind === "github" && !host.endsWith("github.com")) {
        return t("linkGithubWrong", { label: l.label });
      }
    } catch {
      return t("linkInvalid", { label: l.label });
    }
  }
  return null;
}

export async function saveProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "").trim() || null;

  const bodyRaw = String(formData.get("body") ?? "");
  const outcomeText = String(formData.get("outcome") ?? "").trim();

  const periodStartRaw = String(formData.get("periodStart") ?? "").trim();
  const periodEndRaw = String(formData.get("periodEnd") ?? "").trim();

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
    body: parseTiptapDoc(bodyRaw),
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
    return { error: zodErr(parsed) };
  }

  const hostErr = await validateLinkHosts(parsed.data.links);
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
  if (clash.length)
    return { error: (await getTranslations("actions.projects"))("slugTaken") };

  if (
    parsed.data.featured &&
    (await wouldExceedFeaturedLimit("projects", id))
  ) {
    return {
      error: (await getTranslations("actions.projects"))("featureLimitReached"),
    };
  }

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

/**
 * Flip a single project's `featured` flag. Refuses to raise a 4th flag.
 */
export async function toggleProjectFeatured(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getTranslations("actions.projects");
  const id = String(formData.get("id") ?? "").trim();
  const next = formData.get("featured") === "true";
  if (!id) return { error: "Missing id" };

  const [prev] = await db
    .select({ slug: projects.slug, featured: projects.featured })
    .from(projects)
    .where(eq(projects.id, id));
  if (!prev) return { error: "Not found" };

  if (next && (await wouldExceedFeaturedLimit("projects", id))) {
    return { error: t("featureLimitReached") };
  }

  await db
    .update(projects)
    .set({ featured: next, updatedAt: new Date() })
    .where(eq(projects.id, id));

  updateTag(tag.projects());
  updateTag(tag.project(prev.slug));
  return { ok: true };
}
