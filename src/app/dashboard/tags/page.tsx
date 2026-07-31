import { SlugEntityTable } from "@/components/dashboard/slug-entity-table";
import { listTagsWithCount } from "@/lib/db/queries/tags";
import { deleteTag, saveTag } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tags" };

export default async function Page() {
  const rows = await listTagsWithCount();
  return (
    <SlugEntityTable
      rows={rows}
      entity="Tag"
      entityPlural="Tags"
      subtitle="Group posts by topic. 5–8 per post recommended."
      slugMaxLen={30}
      saveAction={saveTag}
      deleteAction={deleteTag}
    />
  );
}
