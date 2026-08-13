import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * PC §5 / §14. One row per entity here; Zod mirrors these constraints in
 * src/schemas/. No media_uses join table — "in use" is a runtime query
 * against posts.cover_media_id / resumes.public_id (ponytail: revisit only
 * if shown slow).
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

// ---------- media ---------------------------------------------------------

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: text("public_id").notNull().unique(), // Cloudinary public_id
  url: text("url").notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  bytes: integer("bytes").notNull(),
  format: varchar("format", { length: 16 }).notNull(),
  folder: varchar("folder", { length: 64 }).notNull(), // portfolio/posts|resume|links
  ...timestamps,
});

// ---------- categories / tags --------------------------------------------

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 30 }).notNull(),
  slug: varchar("slug", { length: 30 }).notNull().unique(),
  ...timestamps,
});

// `kind` splits tag usage across content types so the blog tag picker and
// the project/experience tech-stack picker don't collide. Backfilled to
// `blog` for existing rows via column default; new rows must set it.
export const tagKind = pgEnum("tag_kind", ["blog", "tech"]);

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 30 }).notNull(),
  slug: varchar("slug", { length: 30 }).notNull().unique(),
  kind: tagKind("kind").notNull().default("blog"),
  ...timestamps,
});

// ---------- posts --------------------------------------------------------

export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 70 }).notNull(),
    slug: varchar("slug", { length: 75 }).notNull().unique(),
    metaDescription: varchar("meta_description", { length: 160 }).notNull(),
    excerpt: varchar("excerpt", { length: 300 }).notNull(),
    body: jsonb("body").notNull(), // Tiptap JSON
    coverMediaId: uuid("cover_media_id").references(() => media.id, {
      onDelete: "restrict",
    }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),
    status: postStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    featured: boolean("featured").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index("posts_status_published_at_idx").on(t.status, t.publishedAt),
    index("posts_category_idx").on(t.categoryId),
    index("posts_featured_idx").on(t.featured, t.publishedAt),
  ],
);

export const postsTags = pgTable(
  "posts_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })],
);

// ---------- resumes ------------------------------------------------------

export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicId: text("public_id").notNull().unique(),
    url: text("url").notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    bytes: integer("bytes").notNull(),
    isActive: boolean("is_active").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    // At most one active resume — partial unique index on is_active=true.
    uniqueIndex("resumes_one_active_idx")
      .on(t.isActive)
      .where(sql`${t.isActive} = true`),
  ],
);

// ---------- relations ----------------------------------------------------

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  cover: one(media, {
    fields: [posts.coverMediaId],
    references: [media.id],
  }),
  tags: many(postsTags),
}));

export const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, { fields: [postsTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postsTags.tagId], references: [tags.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postsTags),
  projects: many(projectsTags),
  experiences: many(experiencesTags),
}));

// ---------- projects -----------------------------------------------------

export const projectStatus = pgEnum("project_status", ["draft", "published"]);

// Client engagements (enterprise), personal SaaS (product), OSS refs
// (open-source), and acquisition-shielded work (nda). Category drives
// visual grouping on /projects.
export const projectCategory = pgEnum("project_category", [
  "enterprise",
  "product",
  "open_source",
  "nda",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 130 }).notNull().unique(),
    // One-line summary. Doubles as meta_description fallback when the SEO
    // override is blank.
    tagline: varchar("tagline", { length: 200 }).notNull(),
    // Optional context columns — resume-style.
    client: varchar("client", { length: 100 }),
    location: varchar("location", { length: 100 }),
    role: varchar("role", { length: 100 }),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    // TipTap JSON: rich body + outcome paragraph on the detail page.
    body: jsonb("body").notNull(),
    outcome: text("outcome"),
    category: projectCategory("category").notNull().default("enterprise"),
    coverMediaId: uuid("cover_media_id").references(() => media.id, {
      onDelete: "restrict",
    }),
    // SEO overrides — nullable so DB fallback (title/tagline) can win.
    metaTitle: varchar("meta_title", { length: 70 }),
    metaDescription: varchar("meta_description", { length: 160 }),
    ogImageId: uuid("og_image_id").references(() => media.id, {
      onDelete: "restrict",
    }),
    noindex: boolean("noindex").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    status: projectStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("projects_status_published_at_idx").on(t.status, t.publishedAt),
    index("projects_category_idx").on(t.category),
    index("projects_featured_order_idx").on(t.featured, t.displayOrder),
  ],
);

// Ordered per-project links. `kind` drives the icon (App Store, Play
// Store, GitHub, globe, etc.). Multiple websites/repos/stores per project
// are fine — just add more rows.
export const linkKind = pgEnum("link_kind", [
  "website",
  "case_study",
  "github",
  "demo",
  "app_store",
  "play_store",
  "docs",
  "video",
]);

export const projectLinks = pgTable(
  "project_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    kind: linkKind("kind").notNull(),
    label: varchar("label", { length: 40 }).notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("project_links_project_idx").on(t.projectId)],
);

export const projectsTags = pgTable(
  "projects_tags",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.tagId] })],
);

// ---------- experiences --------------------------------------------------

export const experienceStatus = pgEnum("experience_status", [
  "draft",
  "published",
]);

export const workType = pgEnum("work_type", ["on_site", "remote", "hybrid"]);

// One row per role, not per company — a promotion becomes two rows sharing
// a company_slug so the render layer can group them under the same
// company card.
export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company: varchar("company", { length: 120 }).notNull(),
    companySlug: varchar("company_slug", { length: 130 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    location: varchar("location", { length: 100 }),
    workType: workType("work_type"),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    // Nullable end = still there.
    periodEnd: timestamp("period_end", { withTimezone: true }),
    summary: varchar("summary", { length: 240 }).notNull(),
    highlights: jsonb("highlights").notNull(), // TipTap JSON — resume bullets
    companyUrl: text("company_url"),
    companyLogoId: uuid("company_logo_id").references(() => media.id, {
      onDelete: "restrict",
    }),
    // SEO overrides.
    metaTitle: varchar("meta_title", { length: 70 }),
    metaDescription: varchar("meta_description", { length: 160 }),
    ogImageId: uuid("og_image_id").references(() => media.id, {
      onDelete: "restrict",
    }),
    noindex: boolean("noindex").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    status: experienceStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    featured: boolean("featured").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index("experiences_status_period_idx").on(t.status, t.periodStart),
    index("experiences_company_slug_idx").on(t.companySlug),
    index("experiences_featured_idx").on(t.featured, t.periodStart),
  ],
);

export const experiencesTags = pgTable(
  "experiences_tags",
  {
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.experienceId, t.tagId] })],
);

// ---------- skills -------------------------------------------------------

// Groups mirror the resume section headings so the /skills page can be
// generated by a simple `groupBy`.
export const skillGroup = pgEnum("skill_group", [
  "languages",
  "backend",
  "database",
  "messaging_async",
  "cloud_devops",
  "ai_llm",
  "testing_performance",
  "integrations",
  "security_practice",
  "frontend",
  "working_knowledge",
]);

export const skillProficiency = pgEnum("skill_proficiency", [
  "working",
  "proficient",
  "expert",
]);

export const skillStatus = pgEnum("skill_status", ["active", "archived"]);

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 60 }).notNull(),
    slug: varchar("slug", { length: 70 }).notNull().unique(),
    group: skillGroup("group").notNull(),
    proficiency: skillProficiency("proficiency")
      .notNull()
      .default("proficient"),
    years: integer("years"),
    // Surfaces this skill in hero/summary contexts.
    isPrimary: boolean("is_primary").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    iconMediaId: uuid("icon_media_id").references(() => media.id, {
      onDelete: "restrict",
    }),
    status: skillStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    index("skills_group_order_idx").on(t.group, t.displayOrder),
    index("skills_status_idx").on(t.status),
  ],
);

// ---------- projects / experiences / skills relations --------------------

export const projectsRelations = relations(projects, ({ one, many }) => ({
  cover: one(media, {
    fields: [projects.coverMediaId],
    references: [media.id],
  }),
  ogImage: one(media, {
    fields: [projects.ogImageId],
    references: [media.id],
  }),
  links: many(projectLinks),
  tags: many(projectsTags),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
  project: one(projects, {
    fields: [projectLinks.projectId],
    references: [projects.id],
  }),
}));

export const projectsTagsRelations = relations(projectsTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectsTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, { fields: [projectsTags.tagId], references: [tags.id] }),
}));

export const experiencesRelations = relations(experiences, ({ one, many }) => ({
  companyLogo: one(media, {
    fields: [experiences.companyLogoId],
    references: [media.id],
  }),
  ogImage: one(media, {
    fields: [experiences.ogImageId],
    references: [media.id],
  }),
  tags: many(experiencesTags),
}));

export const experiencesTagsRelations = relations(
  experiencesTags,
  ({ one }) => ({
    experience: one(experiences, {
      fields: [experiencesTags.experienceId],
      references: [experiences.id],
    }),
    tag: one(tags, {
      fields: [experiencesTags.tagId],
      references: [tags.id],
    }),
  }),
);

export const skillsRelations = relations(skills, ({ one }) => ({
  icon: one(media, {
    fields: [skills.iconMediaId],
    references: [media.id],
  }),
}));

// ---------- receipts ------------------------------------------------------

export const receiptStatus = pgEnum("receipt_status", ["active", "archived"]);

/**
 * Home-page "signature receipts" — one row per card in the
 * `SectionReceipts` block. Small, curator-controlled, decoupled from
 * posts/projects so the kicker copy can be tailored for the home surface.
 */
export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kicker: varchar("kicker", { length: 60 }).notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    body: varchar("body", { length: 400 }).notNull(),
    ctaLabel: varchar("cta_label", { length: 40 }).notNull(),
    ctaHref: text("cta_href").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    status: receiptStatus("status").notNull().default("active"),
    featured: boolean("featured").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index("receipts_status_order_idx").on(t.status, t.displayOrder),
    index("receipts_featured_order_idx").on(t.featured, t.displayOrder),
  ],
);
