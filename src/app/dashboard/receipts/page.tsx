import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReceiptsManager } from "@/components/dashboard/receipts-manager";
import { listReceiptsForDashboard } from "@/lib/db/queries/receipts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.nav.items");
  return { title: t("receipts") };
}

export default async function Page() {
  const rows = await listReceiptsForDashboard();
  return <ReceiptsManager rows={rows} />;
}
