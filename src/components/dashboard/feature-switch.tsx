"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActionState } from "@/lib/action-helpers";

type ToggleAction = (
  prev: ActionState,
  fd: FormData,
) => Promise<ActionState>;

/**
 * Row-level "feature on home" Switch. Optimistically flips, rolls back on
 * server error (typically the 3-item cap).
 */
export function FeatureSwitch({
  id,
  featured,
  action,
  labels,
  onDone,
}: {
  id: string;
  featured: boolean;
  action: ToggleAction;
  labels: { feature: string; unfeature: string };
  onDone?: () => void;
}) {
  const [optimistic, setOptimistic] = useOptimistic(featured);
  const [pending, startTransition] = useTransition();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center">
          <Switch
            checked={optimistic}
            disabled={pending}
            aria-label={optimistic ? labels.unfeature : labels.feature}
            onCheckedChange={(next) => {
              startTransition(async () => {
                setOptimistic(next);
                const fd = new FormData();
                fd.set("id", id);
                fd.set("featured", next ? "true" : "false");
                const res = await action(null, fd);
                if (res?.error) {
                  toast.error(res.error);
                  setOptimistic(!next);
                  return;
                }
                toast.success(next ? labels.feature : labels.unfeature);
                onDone?.();
              });
            }}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {optimistic ? labels.unfeature : labels.feature}
      </TooltipContent>
    </Tooltip>
  );
}
