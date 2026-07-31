import { LinksTable } from "@/components/dashboard/links-table";
import { listLinks } from "@/lib/db/queries/links";

export const dynamic = "force-dynamic";
export const metadata = { title: "Links" };

export default async function Page() {
  const rows = await listLinks();
  return <LinksTable rows={rows} />;
}
