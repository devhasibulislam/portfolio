import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { DIRECTION } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/cookies";
import { getTheme } from "@/lib/theme/cookies";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, theme, messages] = await Promise.all([
    getLocale(),
    getTheme(),
    getMessages(),
  ]);
  const dir = DIRECTION[locale];

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
