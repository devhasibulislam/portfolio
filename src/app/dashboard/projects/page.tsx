import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Projects" };

// Stub list page — real table + `New project` form land in Phase 8.
// Sidebar still needs a live target so this shows an honest empty state.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Client engagements, products, and open-source references.
          </p>
        </div>
        <Button disabled>
          <Plus className="me-1 size-4" />
          New project
        </Button>
      </div>
      <div className="rounded-md border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">
          List + create form ship in the next pass. Schema and DB are live.
        </p>
      </div>
    </div>
  );
}
