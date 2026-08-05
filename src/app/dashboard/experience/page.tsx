import { ExperienceManager } from "@/components/dashboard/experience-manager";
import { listMedia } from "@/lib/db/queries/media";
import {
  getExperienceForEdit,
  listExperienceForDashboard,
} from "@/lib/db/queries/experience";

export const metadata = { title: "Experience" };

// Server action for on-demand edit hydration — same pattern as Projects.
async function resolveFull(id: string) {
  "use server";
  return getExperienceForEdit(id);
}

export default async function Page() {
  const [rows, media] = await Promise.all([
    listExperienceForDashboard(),
    listMedia(),
  ]);
  const mediaOptions = media.map((m) => ({
    id: m.id,
    publicId: m.publicId,
    originalName: m.originalName,
  }));
  return (
    <ExperienceManager
      rows={rows}
      mediaOptions={mediaOptions}
      resolveFull={resolveFull}
    />
  );
}
