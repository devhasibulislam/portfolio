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

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 30 }).notNull(),
  slug: varchar("slug", { length: 30 }).notNull().unique(),
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
    ...timestamps,
  },
  (t) => [
    index("posts_status_published_at_idx").on(t.status, t.publishedAt),
    index("posts_category_idx").on(t.categoryId),
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
}));
