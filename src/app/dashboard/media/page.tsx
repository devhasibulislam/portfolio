import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { MediaGrid } from "@/components/dashboard/media-grid";
import { listMedia } from "@/lib/db/queries/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.nav.items");
  return { title: t("media") };
}

export default async function Page() {
  const rows = await listMedia();
  return <MediaGrid rows={rows} />;
}
