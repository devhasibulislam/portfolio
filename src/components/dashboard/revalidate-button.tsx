"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RevalidateButton() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Revalidate public cache"
      title="Revalidate public cache"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch("/dashboard/revalidate", { cache: "no-store" });
          const data = (await res.json()) as { ok?: boolean; revalidated?: string[] };
          if (res.ok && data.ok) {
            toast.success(`Revalidated ${data.revalidated?.length ?? 0} tags`);
          } else {
            toast.error("Revalidate failed");
          }
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Revalidate failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} />
    </Button>
  );
}
