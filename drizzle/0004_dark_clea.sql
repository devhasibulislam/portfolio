ALTER TABLE "posts" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "posts_featured_idx" ON "posts" USING btree ("featured","published_at");--> statement-breakpoint
CREATE INDEX "receipts_featured_order_idx" ON "receipts" USING btree ("featured","display_order");