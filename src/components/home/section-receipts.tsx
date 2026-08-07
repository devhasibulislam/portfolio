import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Signature Receipts — three hardcoded proof cards. Each is a specific,
 * inspectable shipped thing (public repo or live product). This is where
 * the visitor grants senior-engineer status; the metric is bold, the body
 * is concrete, and every card has an outbound link so trust is verifiable.
 *
 * Card shell uses the "double bezel" nested pattern per the high-end
 * visual design skill: outer ring hairline + inner card with soft inner
 * highlight. Concentric border radii (2rem outer, calc(2rem - 6px) inner).
 */

type Receipt = {
  key: "latency" | "rls" | "pipeline";
  href: string;
  external?: boolean;
};

const RECEIPTS: Receipt[] = [
  {
    key: "latency",
    href: "https://github.com/devhasibulislam/api-latency-case-study",
    external: true,
  },
  {
    key: "rls",
    href: "https://github.com/devhasibulislam/nestjs-multitenant-starter",
    external: true,
  },
  { key: "pipeline", href: "https://messagemind.ai/", external: true },
];

export async function SectionReceipts() {
  const t = await getTranslations("home.receipts");

  return (
    <section
      aria-labelledby="receipts-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:py-28 md:py-32"
    >
      <ScrollReveal className="mb-14 max-w-2xl" stagger={0.08}>
        <p
          data-reveal
          className="text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-[0.28em]"
        >
          {t("eyebrow")}
        </p>
        <h2
          data-reveal
          id="receipts-title"
          className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
        >
          {t("title")}
        </h2>
      </ScrollReveal>

      <ScrollReveal
        as="ul"
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
        stagger={0.1}
      >
        {RECEIPTS.map((r) => (
          <li key={r.key} data-reveal>
            <ReceiptCard
              href={r.href}
              external={r.external}
              metric={t(`${r.key}.metric`)}
              title={t(`${r.key}.title`)}
              body={t(`${r.key}.body`)}
              cta={t(`${r.key}.cta`)}
            />
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}

function ReceiptCard({
  href,
  external,
  metric,
  title,
  body,
  cta,
}: {
  href: string;
  external?: boolean;
  metric: string;
  title: string;
  body: string;
  cta: string;
}) {
  const linkProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      {...linkProps}
      className="group block h-full rounded-[2rem] bg-[var(--color-bg)]/40 p-1.5 ring-1 ring-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[var(--color-accent)]/40"
    >
      <div className="relative flex h-full flex-col rounded-[calc(2rem-0.375rem)] bg-[var(--card)] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          {metric}
        </p>
        <h3 className="mt-5 text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
          {title}
        </h3>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {body}
        </p>
        <div className="mt-8 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-fg)]/70 transition-colors group-hover:text-[var(--color-accent)]">
            {cta}
          </span>
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--color-bg)]/60 ring-1 ring-[var(--color-border)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:ring-[var(--color-accent)]/50">
            <ArrowUpRight className="size-4 text-[var(--color-fg)]/80 transition-colors group-hover:text-[var(--color-accent)]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
