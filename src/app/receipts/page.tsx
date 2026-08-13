import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listActiveReceiptsCursor } from "@/lib/db/queries/receipts";
import { PAGE_INITIAL } from "@/lib/pagination";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { ReceiptsInfiniteList } from "@/app/receipts/receipts-infinite-list";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.receipts");
  const title = m("title");
  const description = m("description");
  return {
    title,
    description,
    alternates: { canonical: "/receipts" },
    openGraph: {
      type: "website",
      title: `${title} · Hasibul Islam`,
      description,
      url: `${SITE_URL}/receipts`,
    },
  };
}

async function firstPage() {
  "use cache";
  cacheTag(tag.receipts());
  return listActiveReceiptsCursor({ limit: PAGE_INITIAL });
}

export default async function ReceiptsPage() {
  const [initial, t] = await Promise.all([
    firstPage(),
    getTranslations("receipts"),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pt-24 pb-24">
      <PageBreadcrumb trail={[{ label: t("heading") }]} />
      <header className="mb-14 max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          {t("hero")}
        </p>
      </header>
      <ReceiptsInfiniteList initial={initial} />
    </main>
  );
}
