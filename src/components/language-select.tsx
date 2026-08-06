"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALES, type Locale } from "@/lib/i18n/config";
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
 */
export function LanguageSelect({
  align = "end",
  className,
}: {
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const locale = useLocale() as Locale;
  const [switching, startSwitching] = useTransition();
  const t = useTranslations("footer");
  return (
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
