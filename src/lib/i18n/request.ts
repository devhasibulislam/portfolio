import { getRequestConfig } from "next-intl/server";
import { getLocale } from "./cookies";

/**
 * next-intl request config using the locale cookie. No [locale] URL segment.
 * Message files live under `messages/<locale>.json`.
 */
export default getRequestConfig(async () => {
  const locale = await getLocale();
  return {
    locale,
    messages: (await import(`../../../messages/${locale}.json`)).default,
  };
});
