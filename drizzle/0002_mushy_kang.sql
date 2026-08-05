CREATE TYPE "public"."experience_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."link_kind" AS ENUM('website', 'case_study', 'github', 'demo', 'app_store', 'play_store', 'docs', 'video');--> statement-breakpoint
CREATE TYPE "public"."project_category" AS ENUM('enterprise', 'product', 'open_source', 'nda');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."skill_group" AS ENUM('languages', 'backend', 'database', 'messaging_async', 'cloud_devops', 'ai_llm', 'testing_performance', 'integrations', 'security_practice', 'frontend', 'working_knowledge');--> statement-breakpoint
CREATE TYPE "public"."skill_proficiency" AS ENUM('working', 'proficient', 'expert');--> statement-breakpoint
CREATE TYPE "public"."skill_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."tag_kind" AS ENUM('blog', 'tech');--> statement-breakpoint
CREATE TYPE "public"."work_type" AS ENUM('on_site', 'remote', 'hybrid');--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" varchar(120) NOT NULL,
	"company_slug" varchar(130) NOT NULL,
	"role" varchar(120) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"location" varchar(100),
	"work_type" "work_type",
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone,
	"summary" varchar(240) NOT NULL,
	"highlights" jsonb NOT NULL,
	"company_url" text,
	"company_logo_id" uuid,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"og_image_id" uuid,
	"noindex" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "experience_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiences_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "experiences_tags" (
	"experience_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "experiences_tags_experience_id_tag_id_pk" PRIMARY KEY("experience_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "project_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"kind" "link_kind" NOT NULL,
	"label" varchar(40) NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(120) NOT NULL,
	"slug" varchar(130) NOT NULL,
	"tagline" varchar(200) NOT NULL,
	"client" varchar(100),
	"location" varchar(100),
	"role" varchar(100),
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"body" jsonb NOT NULL,
	"outcome" text,
	"category" "project_category" DEFAULT 'enterprise' NOT NULL,
	"cover_media_id" uuid,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"og_image_id" uuid,
	"noindex" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projects_tags" (
	"project_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "projects_tags_project_id_tag_id_pk" PRIMARY KEY("project_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"slug" varchar(70) NOT NULL,
	"group" "skill_group" NOT NULL,
	"proficiency" "skill_proficiency" DEFAULT 'proficient' NOT NULL,
	"years" integer,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"icon_media_id" uuid,
	"status" "skill_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "kind" "tag_kind" DEFAULT 'blog' NOT NULL;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences_tags" ADD CONSTRAINT "experiences_tags_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences_tags" ADD CONSTRAINT "experiences_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_links" ADD CONSTRAINT "project_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_media_id_media_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects_tags" ADD CONSTRAINT "projects_tags_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects_tags" ADD CONSTRAINT "projects_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_icon_media_id_media_id_fk" FOREIGN KEY ("icon_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experiences_status_period_idx" ON "experiences" USING btree ("status","period_start");--> statement-breakpoint
CREATE INDEX "experiences_company_slug_idx" ON "experiences" USING btree ("company_slug");--> statement-breakpoint
CREATE INDEX "project_links_project_idx" ON "project_links" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_status_published_at_idx" ON "projects" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category");--> statement-breakpoint
CREATE INDEX "projects_featured_order_idx" ON "projects" USING btree ("featured","display_order");--> statement-breakpoint
CREATE INDEX "skills_group_order_idx" ON "skills" USING btree ("group","display_order");--> statement-breakpoint
CREATE INDEX "skills_status_idx" ON "skills" USING btree ("status");