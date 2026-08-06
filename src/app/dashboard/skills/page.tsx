import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SkillsManager } from "@/components/dashboard/skills-manager";
import { listMedia } from "@/lib/db/queries/media";
import { listSkillsForDashboard } from "@/lib/db/queries/skills";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.nav.items");
  return { title: t("skills") };
}

export default async function Page() {
  const [rows, media] = await Promise.all([
    listSkillsForDashboard(),
    listMedia(),
  ]);
  const mediaOptions = media.map((m) => ({
    id: m.id,
    publicId: m.publicId,
    originalName: m.originalName,
  }));
  return <SkillsManager rows={rows} mediaOptions={mediaOptions} />;
}
