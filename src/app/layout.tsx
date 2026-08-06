import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/cookies";
import { DEFAULT_THEME, THEME_COOKIE } from "@/lib/theme/cookies";
import { SiteHeader } from "@/components/site-header";
import { PublicFloatingActions } from "@/components/public-floating-actions";
import { PublicFooter } from "@/components/public-footer";
import { TopProgressBar } from "@/components/top-progress-bar";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Hasibul Islam",
    template: "%s · Hasibul Islam",
  },
  description:
    "Senior full-stack engineer. Backend architecture, LLM/RAG systems, and production Node.js.",
};

// Pre-hydration script: reads the `locale` and `theme` cookies from the
// browser and applies them to `<html lang dir data-theme>` before React
// hydrates. This lets the shell render statically (no server-side
// `cookies()` read) while still avoiding a flash of the wrong locale/theme.
// Required under Next 16 `cacheComponents`: any `cookies()` at the layout
// level triggers a blocking-route warning.
//
// Cookie precedence:
//   1. explicit theme cookie → use it
//   2. no cookie (= "System") → fall through to prefers-color-scheme.
//      Both light and dark branches SET the attribute so the SSR default
//      is overridden either way — otherwise OS-dark leaves the SSR
//      "light" default in place and the page flashes / stays light.
const RTL_LOCALES = "ar,he,ur";
const INIT_SCRIPT = `(function(){try{var d=document.documentElement;var c=document.cookie;var lm=c.match(/(?:^|; )locale=([^;]+)/);if(lm){var l=decodeURIComponent(lm[1]);d.setAttribute('lang',l);d.setAttribute('dir','${RTL_LOCALES}'.split(',').indexOf(l)>-1?'rtl':'ltr');}var tm=c.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);if(tm){d.setAttribute('data-theme',decodeURIComponent(tm[1]));}else{d.setAttribute('data-theme',window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir="ltr"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
        <Suspense fallback={null}>
          <LocalizedShell>{children}</LocalizedShell>
        </Suspense>
      </body>
    </html>
  );
}

/**
 * Async child: reads the cookie-based locale, loads next-intl messages,
 * and renders inside a Suspense boundary so the outer `<html>`/`<body>`
 * shell stays static under `cacheComponents`.
 */
async function LocalizedShell({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TopProgressBar />
      {/* Sticky-footer shell: min-h-svh flex column keeps the footer glued to
          the viewport bottom when the page content is shorter than the
          viewport, and lets it flow naturally below content when longer. */}
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <PublicFooter />
      </div>
      <PublicFloatingActions />
    </NextIntlClientProvider>
  );
}
