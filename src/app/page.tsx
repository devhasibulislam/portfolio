/**
 * Home page — themed shell aligned with /skills, /blog, /resume, and the
 * dashboard so the site reads as one visual system. The R3F hero
 * (previously mounted here) has been retired; the component tree still
 * lives under `src/components/home/*` in case any of it gets salvaged in
 * the upcoming home rework.
 */
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24">
      <header className="mb-12 max-w-2xl">
        <p className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-[0.24em]">
          {t("kicker")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
          {t("hero")}
        </p>
      </header>

      {/*
        Body slot — the redesign lands here. Left intentionally empty so
        the visual rhythm from /skills carries over unchanged.
      */}
    </main>
  );
}
