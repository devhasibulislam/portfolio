import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/cookies";
import { DEFAULT_THEME, THEME_COOKIE } from "@/lib/theme/cookies";
import { SiteHeader } from "@/components/site-header";
import { PublicFloatingActions } from "@/components/public-floating-actions";
import { PublicFooter } from "@/components/public-footer";
import { TopProgressBar } from "@/components/top-progress-bar";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Twitter/X handle used by twitter:site + twitter:creator.
// Change this if the owner registers a different handle.
const TWITTER_HANDLE = "@devhasibulislam";

export async function generateMetadata(): Promise<Metadata> {
  const [t, tBrand, locale] = await Promise.all([
    getTranslations("meta"),
    getTranslations("brand"),
    getLocale(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const siteTitle = t("siteTitle");
  const siteDescription = t("siteDescription");
  const siteName = tBrand("name");

  // hreflang alternates — one entry per supported locale so Google/Bing pick
  // the right variant, plus `x-default` pointing at the canonical URL.
  const languages = Object.fromEntries(LOCALES.map((l) => [l, "/"])) as Record<
    string,
    string
  >;
  languages["x-default"] = "/";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: `%s · ${siteTitle}`,
    },
    description: siteDescription,
    applicationName: siteName,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    generator: "Next.js",
    keywords: [
      "Hasibul Islam",
      "full-stack engineer",
      "Node.js",
      "TypeScript",
      "Next.js",
      "backend architecture",
      "LLM",
      "RAG",
      "PostgreSQL",
      "portfolio",
    ],
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    alternates: {
      canonical: "/",
      languages,
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName,
      title: siteTitle,
      description: siteDescription,
      locale,
      alternateLocale: LOCALES.filter((l) => l !== locale),
      // opengraph-image.tsx in the app root generates the actual image; Next
      // wires it in automatically. The explicit entry here makes it show up
      // in Vercel's OG audit tool with a proper alt text.
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${siteName} — ${siteDescription}`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: siteTitle,
      description: siteDescription,
      images: [
        {
          url: "/opengraph-image",
          alt: `${siteName} — ${siteDescription}`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      // /icon.tsx generates 32×32 PNG at build time.
      // /apple-icon.tsx generates 180×180 PNG for iOS home screens.
      icon: [{ url: "/icon", sizes: "32x32", type: "image/png" }],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: siteName,
    },
    category: "technology",
    // Suppress the `dir` attribute rewrites next-intl warns about — we set
    // dir manually via the pre-hydration script + LanguageSelect.
    other: {
      "og:image:alt": `${siteName} — ${siteDescription}`,
    },
  };
}

/**
 * Viewport / theme-color / color-scheme metadata split out from
 * generateMetadata per Next 15+ convention. Setting these here lets iOS
 * Safari + Android Chrome match the app chrome to the site's palette.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
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
        {/* Vercel Web Analytics + Speed Insights. Client-only, injected at
            the root so every route (public + dashboard) reports pageviews
            and Core Web Vitals. `debug={false}` silences the dev console
            noise. */}
        <Analytics debug={false} />
        <SpeedInsights debug={false} />
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
      <TooltipProvider delayDuration={0}>
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
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}
