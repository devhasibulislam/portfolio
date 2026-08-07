import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StarBackdrop } from "@/components/star-backdrop";
import { SITE_CONFIG } from "@/config/site";
import { Hero } from "@/components/home/hero";
import { SectionReceipts } from "@/components/home/section-receipts";
import { SectionNow } from "@/components/home/section-now";
import { SectionFeaturedProjects } from "@/components/home/section-featured-projects";
import { SectionSelectedExperience } from "@/components/home/section-selected-experience";
import { SectionCoreSkills } from "@/components/home/section-core-skills";
import { SectionFeaturedWriting } from "@/components/home/section-featured-writing";
import { SectionTrackRecord } from "@/components/home/section-track-record";
import { SectionContact } from "@/components/home/section-contact";

/**
 * Home page — the "highlight reel + archive" pattern. Every section on
 * this page is either a hardcoded fact (hero, receipts, now, track record,
 * contact) or a top-3 preview into a dedicated archive page (projects,
 * blog). Sections backed by the dashboard auto-hide when empty so the
 * page collapses gracefully on day one and grows itself as content lands.
 *
 * Order is chosen so that the visitor's trust rises before the ask:
 *
 *   1. Hero — one bold metric hooks the eye (~200 ms → ~20 ms)
 *   2. Signature receipts — three inspectable proof points
 *   3. Now — what he is currently doing (recency signal)
 *   4. Featured projects — DB-driven, hides when empty
 *   5. Track record — the numbers strip (7+ years · 6 countries · 2 exits)
 *   6. Featured writing — DB-driven, hides when empty
 *   7. Contact — closes the story
 *
 * Motion policy per §16 + design-taste-frontend: hero mesh on capable
 * devices only, GSAP ScrollTrigger reveals (one-shot, never scrubbed),
 * count-up on the numbers. `prefers-reduced-motion` disables all of it.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.home");
  const title = m("title");
  const description = m("description");
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title: `${title} · Hasibul Islam`,
      description,
      url: SITE_URL,
    },
  };
}

export default function HomePage() {
  // JSON-LD Person schema so search engines and AI crawlers get structured
  // identity + expertise data — feeds `/llms.txt` consumers too.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_CONFIG.name,
    url: SITE_URL,
    image: `${SITE_URL}${SITE_CONFIG.brand.avatar}`,
    email: SITE_CONFIG.email,
    jobTitle: "Sr. Backend Architect",
    worksFor: {
      "@type": "Organization",
      name: "ZMC Technologies Limited",
      url: "https://zmctechnologies.com/",
    },
    sameAs: Object.values(SITE_CONFIG.socials).filter(Boolean),
    knowsAbout: [
      "Node.js",
      "TypeScript",
      "NestJS",
      "PostgreSQL",
      "Row-Level Security",
      "Kafka",
      "BullMQ",
      "AWS",
      "LLM",
      "RAG",
      "Model Context Protocol",
      "Backend architecture",
    ],
  };

  return (
    <>
      {/* CSS-only starfield backdrop — no JS, no WebGL — theme-aware. */}
      <StarBackdrop />

      <script
        type="application/ld+json"
        // JSON.stringify escapes </script> tags safely; no user input here.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <main className="relative w-full">
        <Hero />
        <SectionReceipts />
        <SectionNow />
        <SectionFeaturedProjects />
        <SectionSelectedExperience />
        <SectionCoreSkills />
        <SectionFeaturedWriting />
        <SectionTrackRecord />
        <SectionContact />
      </main>
    </>
  );
}
