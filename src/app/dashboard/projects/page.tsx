import { ProjectsManager } from "@/components/dashboard/projects-manager";
import { listMedia } from "@/lib/db/queries/media";
import {
  getProjectForEdit,
  listProjectsForDashboard,
} from "@/lib/db/queries/projects";

export const metadata = { title: "Projects" };

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
