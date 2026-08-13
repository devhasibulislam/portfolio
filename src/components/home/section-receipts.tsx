import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listReceiptsForHome } from "@/lib/db/queries/receipts";
import { ScrollReveal } from "./scroll-reveal";
import { ArrowPill, BezelLink, SectionHeader, SeeAllLink } from "./_shared";

async function loadReceipts() {
  "use cache";
  cacheTag(tag.receipts());
  return listReceiptsForHome();
}

export async function SectionReceipts() {
  const [items, t] = await Promise.all([
    loadReceipts(),
    getTranslations("home.receipts"),
  ]);

  // Nothing to show until the curator flips a receipt on.
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="receipts-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <SectionHeader
        title={t("title")}
        id="receipts-title"
        action={<SeeAllLink href="/receipts" label={t("seeAll")} />}
      />
      <ScrollReveal
        as="ul"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        stagger={0.1}
      >
        {items.map((r) => (
          <li key={r.id} data-reveal>
            <ReceiptCard
              href={r.ctaHref}
              metric={r.kicker}
              title={r.title}
              body={r.body}
              cta={r.ctaLabel}
            />
          </li>
        ))}
      </ScrollReveal>
    </section>
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
