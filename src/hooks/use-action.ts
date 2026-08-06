"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionState } from "@/lib/action-helpers";

type Action<S extends ActionState = ActionState> = (
  prev: S,
  fd: FormData,
) => Promise<S>;

type RunOptions = {
  /** Called after a successful action, before router.refresh(). */
  onOk?: () => void;
  /** Skip the automatic router.refresh() (e.g. when the action redirects). */
  skipRefresh?: boolean;
  /** Toast to show on success. Falsy skips the success toast entirely. */
  successToast?: string | null | false;
};

/**
 * The five lines every dashboard mutation used to write:
 * dispatch → read `res.error` → toast → success toast → router.refresh().
 * `useAction` collapses that to a single `run(fd, { successToast })` call.
 */
export function useAction<S extends ActionState = ActionState>(
  action: Action<S>,
) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fd: FormData, opts: RunOptions = {}) => {
    startTransition(async () => {
      const res = (await action(null as S, fd)) as S;
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      if (opts.successToast) toast.success(opts.successToast);
      opts.onOk?.();
      if (!opts.skipRefresh) router.refresh();
    });
  };

  return { pending, run };
}
