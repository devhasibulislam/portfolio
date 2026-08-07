import { getTranslations } from "next-intl/server";
import { ArrowPill, Bezel, SectionHeader } from "./_shared";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Signature Receipts — three hardcoded proof cards. Each is a specific,
 * inspectable shipped thing (public repo or live product). This is where
 * the visitor grants senior-engineer status; the metric is bold, the body
 * is concrete, and every card has an outbound link so trust is verifiable.
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
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <ScrollReveal stagger={0.08}>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          id="receipts-title"
        />
      </ScrollReveal>

      <ScrollReveal
        as="ul"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        stagger={0.1}
      >
        {RECEIPTS.map((r) => (
          <li key={r.key} data-reveal>
            <Bezel href={r.href} external={r.external} innerClassName="p-7">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                {t(`${r.key}.metric`)}
              </p>
              <h3 className="mt-5 text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                {t(`${r.key}.title`)}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {t(`${r.key}.body`)}
              </p>
              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-fg)]/70 transition-colors group-hover:text-[var(--color-accent)]">
                  {t(`${r.key}.cta`)}
                </span>
                <ArrowPill size={8} />
              </div>
            </Bezel>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
