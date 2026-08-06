"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIRECTION, LOCALES, type Locale } from "@/lib/i18n/config";
import { setLocaleAction } from "@/lib/i18n/actions";

const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
  ar: "العربية",
  ur: "اردو",
  he: "עברית",
};

/**
 * Cookie-backed locale switcher. Shared by the public footer and the
 * dashboard sidebar so both surfaces use the exact same wiring.
 *
 * The `<html lang>` and `<html dir>` attributes are updated eagerly on the
 * client — the SSR root sets them at initial paint via an inline script, but
 * mid-flight cookie changes never re-run that script. Without this sync,
 * RTL/LTR wouldn't flip until a hard reload.
 */
export function LanguageSelect({
  align = "end",
  className,
}: {
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const [switching, startSwitching] = useTransition();
  const t = useTranslations("footer");
  return (
    <Select
      value={locale}
      disabled={switching}
      onValueChange={(next) =>
        startSwitching(async () => {
          const nextLocale = next as Locale;
          await setLocaleAction(nextLocale);
          if (typeof document !== "undefined") {
            document.documentElement.lang = nextLocale;
            document.documentElement.dir = DIRECTION[nextLocale];
          }
          router.refresh();
        })
      }
    >
      <SelectTrigger
        size="sm"
        aria-label={t("langLabel")}
        className={className ?? "h-8 min-w-28 text-xs"}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align={align}>
        {LOCALES.map((l) => (
          <SelectItem key={l} value={l} className="text-xs">
            {LOCALE_LABEL[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
