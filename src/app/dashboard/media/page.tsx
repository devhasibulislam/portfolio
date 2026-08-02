import { MediaGrid } from "@/components/dashboard/media-grid";
import { listMedia } from "@/lib/db/queries/media";

export const metadata = { title: "Media" };

export default async function Page() {
  const rows = await listMedia();
  return <MediaGrid rows={rows} />;
}
