import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Experience" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Experience</h1>
          <p className="text-muted-foreground text-sm">
            One row per role. Promotions share a company slug and group on the
            public page.
          </p>
        </div>
        <Button disabled>
          <Plus className="me-1 size-4" />
          New role
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
