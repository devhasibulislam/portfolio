"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LanguageSelect } from "@/components/language-select";
import { useTranslations } from "next-intl";
import { SITE_CONFIG, type SocialKey } from "@/config/site";

// Social channels — labels come from i18n so tooltips + aria-labels swap
// language with the site chrome. URLs live in `src/config/site.ts` so a
// fork edits one file.
const SOCIAL_ICONS: Record<SocialKey, string> = {
  linkedin: "/social/linkedin.webp",
  github: "/social/github.webp",
  facebook: "/social/facebook.webp",
  youtube: "/social/youtube.webp",
  productHunt: "/social/product-hunt.webp",
};

const SOCIALS = (Object.entries(SITE_CONFIG.socials) as [SocialKey, string][])
  .filter(([, href]) => Boolean(href))
  .map(([key, href]) => ({ key, href, src: SOCIAL_ICONS[key] }));

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
            <LanguageSelect />
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
