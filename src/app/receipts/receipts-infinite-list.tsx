"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useCursor } from "@/hooks/use-cursor";
import { loadMoreActiveReceipts } from "@/app/receipts/list-actions";
import { ArrowPill, BezelLink } from "@/components/home/_shared";
import type {
  PublicReceipt,
  ReceiptsPage,
} from "@/lib/db/queries/receipts";

export function ReceiptsInfiniteList({ initial }: { initial: ReceiptsPage }) {
  const { items, hasMore, loading, error, loadMore } =
    useCursor<PublicReceipt>(initial, loadMoreActiveReceipts);
  const t = useTranslations("receipts");
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
      <div className="rounded-md border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <li key={r.id}>
            <ReceiptCard
              href={r.ctaHref}
              metric={r.kicker}
              title={r.title}
              body={r.body}
              cta={r.ctaLabel}
            />
          </li>
        ))}
      </ul>
      <div ref={sentinel} aria-hidden className="h-1" />
      {loading ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          {t("loadingMore")}
        </p>
      ) : null}
      {error ? (
        <p className="text-destructive py-6 text-center text-sm">
          {t("loadError")}
        </p>
      ) : null}
    </>
  );
}

function ReceiptCard({
  href,
  metric,
  title,
  body,
  cta,
}: {
  href: string;
  metric: string;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <BezelLink href={href} external innerClassName="p-7">
      <p className="font-mono text-sm font-medium tracking-tight text-[var(--color-accent)]">
        {metric}
      </p>
      <h3 className="mt-5 text-xl font-semibold leading-tight tracking-tight text-balance sm:text-2xl">
        {title}
      </h3>
      <p className="text-muted-foreground mt-3 text-base leading-relaxed">
        {body}
      </p>
      <div className="mt-auto flex items-center justify-between pt-8">
        <span className="text-sm text-[var(--color-fg)]/70 transition-colors group-hover:text-[var(--color-accent)]">
          {cta}
        </span>
        <ArrowPill size={8} />
      </div>
    </BezelLink>
  );
}
