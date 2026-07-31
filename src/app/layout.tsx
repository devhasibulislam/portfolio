import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { DIRECTION } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/cookies";
import { getTheme, THEME_COOKIE } from "@/lib/theme/cookies";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hasibul Islam",
    template: "%s · Hasibul Islam",
  },
  description:
    "Senior full-stack engineer. Backend architecture, LLM/RAG systems, and production Node.js.",
};

// First-visit no-flash: if the theme cookie is absent, respect the OS
// preference before hydration. Server render still ships DEFAULT_THEME so
// the CSS variables are always defined. § 8, deferred Phase 0 TODO.
const THEME_INIT_SCRIPT = `(function(){try{if(document.cookie.indexOf('${THEME_COOKIE}=')!==-1)return;if(window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, theme, messages, store] = await Promise.all([
    getLocale(),
    getTheme(),
    getMessages(),
    cookies(),
  ]);
  const dir = DIRECTION[locale];
  const themeCookieSet = store.has(THEME_COOKIE);

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {!themeCookieSet && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        </head>
      )}
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
