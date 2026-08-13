"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RevalidateButton() {
  const [busy, setBusy] = useState(false);
  const t = useTranslations("dashboard.revalidate");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("tooltip")}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await fetch("/dashboard/revalidate", {
                cache: "no-store",
              });
              const data = (await res.json()) as {
                ok?: boolean;
                revalidated?: string[];
              };
              if (res.ok && data.ok) {
                toast.success(
                  t("success", { count: data.revalidated?.length ?? 0 }),
                );
              } else {
                toast.error(t("error"));
              }
            } catch (e) {
              toast.error(e instanceof Error ? e.message : t("error"));
            } finally {
              setBusy(false);
            }
          }}
        >
          <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("tooltip")}</TooltipContent>
    </Tooltip>
  );
}
