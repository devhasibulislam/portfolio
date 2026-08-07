import { Mail, MessageCircle, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/config/site";
import { ArrowPill, Bezel } from "./_shared";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Contact strip — closes the home page. Duplicates the floating-action
 * targets (WhatsApp / Telegram / Email) as an anchored panel so a visitor
 * who scrolled to the bottom has a clear next step without scanning back
 * up for the floating button.
 */

const CONTACTS = [
  {
    key: "whatsapp",
    href: `https://wa.me/${SITE_CONFIG.phone}`,
    icon: <MessageCircle className="size-4" />,
  },
  {
    key: "telegram",
    href: `https://t.me/${SITE_CONFIG.username}`,
    icon: <Send className="size-4" />,
  },
  {
    key: "email",
    href: `mailto:${SITE_CONFIG.email}`,
    icon: <Mail className="size-4" />,
  },
] as const;

export async function SectionContact() {
  const t = await getTranslations("home.contact");

  return (
    <section
      aria-labelledby="contact-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <ScrollReveal stagger={0.08}>
        <Bezel
          className="overflow-hidden"
          innerClassName="overflow-hidden px-8 py-12 sm:px-12 sm:py-16 md:px-16"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -end-24 -bottom-24 size-72 rounded-full bg-[var(--color-accent)]/20 blur-3xl"
          />

          <div className="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p
                data-reveal
                className="text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-[0.28em]"
              >
                {t("eyebrow")}
              </p>
              <h2
                data-reveal
                id="contact-title"
                className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
              >
                {t("title")}
              </h2>
              <p
                data-reveal
                className="text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
              >
                {t("body")}
              </p>
              <p
                data-reveal
                className="text-muted-foreground/70 mt-5 font-mono text-xs uppercase tracking-[0.18em]"
              >
                {t("response")}
              </p>
            </div>

            <ul data-reveal className="flex flex-col gap-3 md:min-w-[16rem]">
              {CONTACTS.map((c) => (
                <li key={c.key}>
                  <ContactRow href={c.href} label={t(c.key)} icon={c.icon} />
                </li>
              ))}
            </ul>
          </div>
        </Bezel>
      </ScrollReveal>
    </section>
  );
}

function ContactRow({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  // Derive external-ness from the href scheme — no need for a separate
  // `isEmail` prop when the URL scheme carries the same information.
  const external = !href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center justify-between gap-4 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/50 py-3 pe-2 ps-5 text-sm font-medium text-[var(--color-fg)] backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg)]/70"
    >
      <span className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          {icon}
        </span>
        {label}
      </span>
      <ArrowPill size={8} />
    </a>
  );
}
