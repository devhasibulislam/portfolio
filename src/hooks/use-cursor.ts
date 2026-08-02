"use client";

import { useCallback, useRef, useState, useTransition } from "react";

export type CursorPage<T> = { items: T[]; nextCursor: string | null };

/**
 * Cursor-based paginated list. One implementation, per §14 — parameterised
 * by the loader so /blog, /blog/category/[slug], /blog/tag/[slug] can share
 * this hook. The server-provided first page seeds the state (SSR-friendly);
 * subsequent pages arrive via `loadMore()`.
 */
export function useCursor<T>(
  initial: CursorPage<T>,
  loadNext: (cursor: string) => Promise<CursorPage<T>>,
) {
  const [items, setItems] = useState<T[]>(initial.items);
  const [cursor, setCursor] = useState<string | null>(initial.nextCursor);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Guard against a slow response getting re-triggered by IntersectionObserver.
  const inflight = useRef(false);

  const loadMore = useCallback(() => {
    if (!cursor || pending || inflight.current) return;
    inflight.current = true;
    startTransition(async () => {
      try {
        const page = await loadNext(cursor);
        setItems((prev) => [...prev, ...page.items]);
        setCursor(page.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load more");
      } finally {
        inflight.current = false;
      }
    });
  }, [cursor, loadNext, pending]);

  return {
    items,
    hasMore: cursor !== null,
    loading: pending,
    error,
    loadMore,
  };
}
