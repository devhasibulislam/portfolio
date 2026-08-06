import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ResumeManager } from "@/components/dashboard/resume-manager";
import { listResumes } from "@/lib/db/queries/resumes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.nav.items");
  return { title: t("resume") };
}

export default async function Page() {
  const rows = await listResumes();
  return <ResumeManager rows={rows} />;
}
