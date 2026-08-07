import Link from "next/link";
import { getCldImageUrl } from "next-cloudinary";
import { cacheTag } from "next/cache";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listPublishedPostsCursor } from "@/lib/db/queries/public-posts";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Featured writing — home page teaser for `/blog`. Reads the same cursor
 * query the full list uses, capped to 3. Auto-hides when the dashboard
 * has no published posts. Cached under `tag.posts()` so publishing bust
 * it instantly per §13.
 */

async function loadTop3() {
  "use cache";
  cacheTag(tag.posts());
  const page = await listPublishedPostsCursor({ limit: 3 });
  return page.items;
}

export async function SectionFeaturedWriting() {
  const [rows, t] = await Promise.all([
    loadTop3(),
    getTranslations("home.featuredWriting"),
  ]);

  if (rows.length === 0) return null;

  // Match the featured-projects behaviour: adapt the grid to the row
  // count so single or double cards aren't stranded in wide 3-col layouts.
  const gridCols =
    rows.length === 1
      ? "grid-cols-1 max-w-md mx-auto"
      : rows.length === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <section
      aria-labelledby="featured-writing-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:py-28 md:py-32"
    >
      <ScrollReveal
        className="mb-14 flex flex-wrap items-end justify-between gap-6"
        stagger={0.08}
      >
        <div data-reveal className="max-w-2xl">
          <p className="text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-[0.28em]">
            {t("eyebrow")}
          </p>
          <h2
            id="featured-writing-title"
            className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
          >
            {t("title")}
          </h2>
        </div>
        <Link
          data-reveal
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
        >
          {t("seeAll")}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </ScrollReveal>

      <ScrollReveal
        as="ul"
        className={`grid gap-6 ${gridCols}`}
        stagger={0.1}
      >
        {rows.map((p) => (
          <li key={p.id} data-reveal>
            <PostCard post={p} />
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}

type Card = Awaited<ReturnType<typeof listPublishedPostsCursor>>["items"][number];

function PostCard({ post }: { post: Card }) {
  const cover = post.coverPublicId
    ? getCldImageUrl({ src: post.coverPublicId, width: 900 })
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full rounded-[2rem] bg-[var(--color-bg)]/40 p-1.5 ring-1 ring-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[var(--color-accent)]/40"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[var(--card)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[var(--color-brand-navy)] to-[var(--color-brand-ink)]">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-fg)]/40">
                {post.categoryName ?? "Note"}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {post.categoryName ?? "Note"}
          </p>
          <h3 className="mt-3 text-lg font-semibold leading-tight tracking-tight">
            {post.title}
          </h3>
          <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
            {post.excerpt}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <time
              dateTime={post.publishedAt}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg)]/60"
            >
              {new Date(post.publishedAt).toISOString().slice(0, 10)}
            </time>
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--color-bg)]/60 ring-1 ring-[var(--color-border)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="size-3.5 text-[var(--color-fg)]/80 transition-colors group-hover:text-[var(--color-accent)]" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
