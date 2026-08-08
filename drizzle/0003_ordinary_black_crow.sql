CREATE TYPE "public"."receipt_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kicker" varchar(60) NOT NULL,
	"title" varchar(120) NOT NULL,
	"body" varchar(400) NOT NULL,
	"cta_label" varchar(40) NOT NULL,
	"cta_href" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "receipt_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "receipts_status_order_idx" ON "receipts" USING btree ("status","display_order");
--> statement-breakpoint
INSERT INTO "receipts" ("kicker", "title", "body", "cta_label", "cta_href", "display_order", "status") VALUES
  ('~200 ms → ~20 ms', 'Hot-path list API rewrite', 'Compound indexing on (tenant_id, created_at), single-join query rewrites, cache-aside on hot pages, DTO projection. Autocannon benchmarks and green CI on GitHub.', 'Read the case study', 'https://github.com/devhasibulislam/api-latency-case-study', 10, 'active'),
  ('Zero cross-tenant leaks', 'Multi-tenant Row-Level Security starter', 'Postgres RLS with 8 integration tests that actively try to leak data across tenants. Boundary moved from application code to the database.', 'View on GitHub', 'https://github.com/devhasibulislam/nestjs-multitenant-starter', 20, 'active'),
  ('5,000+ companies served', 'Message pipeline at MessageMind', 'WhatsApp, Messenger, Instagram and web-chat over NestJS microservices with Kafka and BullMQ. Meta Business Partner, GDPR-hosted in Frankfurt.', 'See the product', 'https://messagemind.ai/', 30, 'active');
