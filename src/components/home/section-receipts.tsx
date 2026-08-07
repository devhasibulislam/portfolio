import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "./scroll-reveal";
import { ArrowPill, BezelLink, SectionHeader } from "./_shared";

type Receipt = { key: "latency" | "rls" | "pipeline"; href: string };

const RECEIPTS: Receipt[] = [
  {
    key: "latency",
    href: "https://github.com/devhasibulislam/api-latency-case-study",
  },
  {
    key: "rls",
    href: "https://github.com/devhasibulislam/nestjs-multitenant-starter",
  },
  { key: "pipeline", href: "https://messagemind.ai/" },
];

export async function SectionReceipts() {
  const t = await getTranslations("home.receipts");

  return (
    <section
      aria-labelledby="receipts-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <SectionHeader title={t("title")} id="receipts-title" />
      <ScrollReveal
        as="ul"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        stagger={0.1}
      >
        {RECEIPTS.map((r) => (
          <li key={r.key} data-reveal>
            <ReceiptCard
              href={r.href}
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
