import { ResumeManager } from "@/components/dashboard/resume-manager";
import { listResumes } from "@/lib/db/queries/resumes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resume" };

export default async function Page() {
  const rows = await listResumes();
  return <ResumeManager rows={rows} />;
}
