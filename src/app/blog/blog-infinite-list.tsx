"use client";

import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { useEffect, useRef } from "react";
import { useCursor } from "@/hooks/use-cursor";
import { loadMoreBlogPosts } from "@/app/blog/actions";
import type { PostsPage, PublicPostCard } from "@/lib/db/queries/public-posts";

/**
 * Renders the SSR-seeded first page plus an IntersectionObserver sentinel
 * that requests more via the shared `useCursor` hook. No offset pagination
 * per PROJECT_CONTEXT §13 — cursor only.
 *
 * `loader` defaults to the unfiltered posts action so the base `/blog`
 * page stays a one-arg call; category/tag pages pass their own action.
 */
export function BlogInfiniteList({
  initial,
  loader = loadMoreBlogPosts,
}: {
  initial: PostsPage;
  loader?: (cursor: string) => Promise<PostsPage>;
}) {
  const { items, hasMore, loading, error, loadMore } =
    useCursor<PublicPostCard>(initial, loader);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center">No posts yet.</p>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <li key={p.id}>
            {/* Mark the first card's cover as LCP-eligible. */}
            <PostCard post={p} priority={i === 0} />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div ref={sentinel} className="py-10 text-center">
          <span
            className="text-muted-foreground text-sm"
            aria-live="polite"
            aria-busy={loading}
          >
            {loading ? "Loading more…" : "Scroll for more"}
          </span>
        </div>
      ) : (
        <p className="text-muted-foreground py-10 text-center text-sm">
          {items.length > (initial.items.length || 0)
            ? "You've reached the end."
            : ""}
        </p>
      )}

      {error ? (
        <p role="alert" className="text-destructive py-4 text-center text-sm">
          {error}
        </p>
      ) : null}
    </>
  );
}

function PostCard({
  post,
  priority,
}: {
  post: PublicPostCard;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 focus-visible:outline-2"
    >
      <div className="bg-muted relative aspect-[1200/630] overflow-hidden rounded-xl ring-1 ring-black/5 transition-shadow group-hover:ring-black/10">
        {post.coverPublicId ? (
          <CldImage
            src={post.coverPublicId}
            width={1200}
            height={630}
            crop="fill"
            gravity="auto"
            alt={post.title}
            priority={priority}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        {post.categoryName ? (
          <span className="text-sm font-medium text-[var(--color-accent)]">
            {post.categoryName}
          </span>
        ) : null}
        <h2 className="text-xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-[var(--color-accent)]">
          {post.title}
        </h2>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {post.excerpt}
        </p>
        <time
          dateTime={post.publishedAt}
          className="text-muted-foreground/80 mt-1 text-xs tabular-nums"
        >
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
    </Link>
  );
}
