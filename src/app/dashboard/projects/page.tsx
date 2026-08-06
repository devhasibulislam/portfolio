import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ProjectsManager } from "@/components/dashboard/projects-manager";
import { listMedia } from "@/lib/db/queries/media";
import {
  getProjectForEdit,
  listProjectsForDashboard,
} from "@/lib/db/queries/projects";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.nav.items");
  return { title: t("projects") };
}

// Server action passed down to the client manager — lets the edit dialog
// hydrate a single row's full body + links on demand, keeping the list
// query small.
async function resolveFull(id: string) {
  "use server";
  return getProjectForEdit(id);
}

export default async function Page() {
  const [rows, media] = await Promise.all([
    listProjectsForDashboard(),
    listMedia(),
  ]);
  const mediaOptions = media.map((m) => ({
    id: m.id,
    publicId: m.publicId,
    originalName: m.originalName,
  }));
  return (
    <ProjectsManager
      rows={rows}
      mediaOptions={mediaOptions}
      resolveFull={resolveFull}
    />
  );
}
