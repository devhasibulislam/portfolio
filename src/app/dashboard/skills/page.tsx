import { SkillsManager } from "@/components/dashboard/skills-manager";
import { listMedia } from "@/lib/db/queries/media";
import { listSkillsForDashboard } from "@/lib/db/queries/skills";

export const metadata = { title: "Skills" };

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
