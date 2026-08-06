"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { setLocaleAction } from "@/lib/i18n/actions";
import { useLocale, useTranslations } from "next-intl";

const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
  ar: "العربية",
  ur: "اردو",
  he: "עברית",
};

// Social channels — labels come from i18n so tooltips + aria-labels swap
// language with the site chrome.
const SOCIALS: {
  href: string;
  key: "linkedin" | "github" | "facebook" | "youtube" | "productHunt";
  src: string;
}[] = [
  {
    href: "https://linkedin.com/in/devhasibulislam",
    key: "linkedin",
    src: "/social/linkedin.webp",
  },
  {
    href: "https://github.com/devhasibulislam",
    key: "github",
    src: "/social/github.webp",
  },
  {
    href: "https://facebook.com/devhasibulislam",
    key: "facebook",
    src: "/social/facebook.webp",
  },
  {
    href: "https://youtube.com/@devhasibulislam",
    key: "youtube",
    src: "/social/youtube.webp",
  },
  {
    href: "https://producthunt.com/@devhasibulislam",
    key: "productHunt",
    src: "/social/product-hunt.webp",
  },
];

/**
 * Flat public footer. Renders under every public route, hidden on
 * `/dashboard*` and `/login` (matches PublicFloatingActions' hide rule).
 * One row on desktop (name + role on the start, social icons on the end),
 * wraps to two rows on narrow screens. Copyright sits under a `border-t`.
 *
 * DM channels (WhatsApp / Telegram / Email) intentionally live only in the
 * floating "Contact with Hasib" menu so the footer stays a public-presence
 * strip, not a contact form.
 */
export function PublicFooter() {
  const pathname = usePathname();
  const isPublic = pathname !== "/login" && !pathname.startsWith("/dashboard");
  const locale = useLocale() as Locale;
  const [switching, startSwitching] = useTransition();
  const t = useTranslations("footer");
  if (!isPublic) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
        <div className="min-w-0">
          <p className="text-foreground text-sm font-semibold">{t("name")}</p>
          <p className="text-muted-foreground mt-1 text-xs">{t("tagline")}</p>
        </div>

        <ul className="flex flex-wrap items-center gap-2">
          <TooltipProvider delayDuration={150}>
            {SOCIALS.map((s) => {
              const label = t(`socials.${s.key}`);
              return (
                <li key={s.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2"
                      >
                        <Image
                          src={s.src}
                          alt=""
                          width={20}
                          height={20}
                          className="size-5 rounded-sm"
                        />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6}>
                      {label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </TooltipProvider>
        </ul>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="text-muted-foreground text-xs">
            {t("copyright", { year })}
          </p>
          <div className="flex items-center gap-4">
            <Select
              value={locale}
              disabled={switching}
              onValueChange={(next) =>
                startSwitching(async () => {
                  await setLocaleAction(next as Locale);
                })
              }
            >
              <SelectTrigger
                size="sm"
                aria-label={t("langLabel")}
                className="h-8 min-w-28 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l} className="text-xs">
                    {LOCALE_LABEL[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="text-muted-foreground inline-flex cursor-not-allowed items-center gap-1 text-xs"
                  >
                    {t("source")}
                    <Lock className="size-3.5" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6}>
                  {t("sourceTooltip")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </footer>
  );
}
