import { SkillsManager } from "@/components/dashboard/skills-manager";
import { listSkillsForDashboard } from "@/lib/db/queries/skills";

export const metadata = { title: "Skills" };

export default async function Page() {
  const rows = await listSkillsForDashboard();
  return <SkillsManager rows={rows} />;
}
